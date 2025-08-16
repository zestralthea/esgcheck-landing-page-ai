-- Migration: Create Helper Functions
-- Description: Common utility functions used across the database

-- Add missing column needed by GDPR helper (matches design doc)
ALTER TABLE IF EXISTS organization_members
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 1) Helper: get current authenticated user id (safe alias)
CREATE OR REPLACE FUNCTION auth_user_id() 
RETURNS uuid 
LANGUAGE sql 
STABLE 
AS $$
  SELECT auth.uid()
$$;

COMMENT ON FUNCTION auth_user_id IS 'Get current authenticated user ID via Supabase auth.uid()';

-- 2) Helper: list organizations for a user (accepted only)
CREATE OR REPLACE FUNCTION user_organizations(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
AS $$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = user_uuid 
    AND accepted_at IS NOT NULL
    AND deleted_at IS NULL
$$;

COMMENT ON FUNCTION user_organizations IS 'Return all organization IDs where user is an accepted member';

-- 3) Helper: auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at IS 'Trigger function to set updated_at=now() on row update';

-- 4) Helper: cascade soft delete for reports to analyses/exports
-- Note: the trigger hookup is created in the triggers migration
CREATE OR REPLACE FUNCTION soft_delete_report_cascade()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- Soft delete related analyses
    UPDATE esg_analyses 
    SET deleted_at = NEW.deleted_at 
    WHERE report_id = NEW.id 
      AND deleted_at IS NULL;

    -- Soft delete related exports
    UPDATE esg_analysis_exports 
    SET deleted_at = NEW.deleted_at 
    WHERE analysis_id IN (
      SELECT id FROM esg_analyses WHERE report_id = NEW.id
    ) AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION soft_delete_report_cascade IS 'When a report is soft-deleted, mark analyses/exports soft-deleted too';

-- 5) GDPR helper: remove/anonymize user PII (DB-only; auth.users deletion must be done via Admin API)
CREATE OR REPLACE FUNCTION gdpr_delete_user_data(user_uuid uuid)
RETURNS void AS $$
BEGIN
  -- Hard delete PII in profiles
  DELETE FROM profiles WHERE id = user_uuid;

  -- Anonymize activity logs
  UPDATE activity_logs 
  SET user_id = NULL, 
      ip_address = NULL, 
      user_agent = 'GDPR_DELETED'
  WHERE user_id = user_uuid;

  -- Anonymize document access logs
  UPDATE document_access_logs 
  SET user_id = NULL, 
      ip_address = NULL
  WHERE user_id = user_uuid;

  -- Anonymize references in business records
  UPDATE esg_reports SET created_by = NULL WHERE created_by = user_uuid;
  UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = user_uuid;
  UPDATE jobs SET created_by = NULL WHERE created_by = user_uuid;

  -- Mark organization memberships as deleted (do not remove historical ties)
  UPDATE organization_members 
  SET deleted_at = now()
  WHERE user_id = user_uuid AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION gdpr_delete_user_data IS 'Erase/anonymize user PII across app tables. Use Admin API to delete auth.users.';