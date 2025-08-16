# SQL Migration Files - Part 2

Continuation of migration files for the complete schema implementation.

## 017: System Settings (continued)
**File**: `20250101000016_create_system_settings.sql`

```sql
-- Migration: Create System Settings Table
-- Description: Application configuration storage

CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_public ON system_settings(is_public) WHERE is_public = true;

-- Initial settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
  ('maintenance_mode', 'false', 'Enable maintenance mode', false),
  ('max_file_size_mb', '50', 'Maximum file upload size in MB', true),
  ('allowed_file_types', '["pdf", "docx", "doc", "txt"]', 'Allowed file types for upload', true),
  ('analysis_timeout_seconds', '300', 'Timeout for analysis jobs', false),
  ('rate_limit_requests_per_minute', '60', 'API rate limit per user', false);

-- Comments
COMMENT ON TABLE system_settings IS 'System-wide configuration settings';
```

## 018: Helper Functions
**File**: `20250101000017_create_helper_functions.sql`

```sql
-- Migration: Create Helper Functions
-- Description: Utility functions for common operations

-- Get authenticated user ID
CREATE OR REPLACE FUNCTION auth_user_id() 
RETURNS uuid 
LANGUAGE sql 
STABLE 
AS $$
  SELECT auth.uid()
$$;

-- Get user's organizations
CREATE OR REPLACE FUNCTION user_organizations(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
AS $$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = user_uuid 
    AND accepted_at IS NOT NULL;
$$;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Soft delete cascade for reports
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

-- GDPR data deletion (non-auth parts)
CREATE OR REPLACE FUNCTION gdpr_delete_user_data(user_uuid uuid)
RETURNS void AS $$
BEGIN
  -- Hard delete PII from profiles
  DELETE FROM profiles WHERE id = user_uuid;
  
  -- Anonymize activity logs
  UPDATE activity_logs 
  SET user_id = NULL, 
      ip_address = NULL, 
      user_agent = 'GDPR_DELETED'
  WHERE user_id = user_uuid;
  
  UPDATE document_access_logs 
  SET user_id = NULL, 
      ip_address = NULL
  WHERE user_id = user_uuid;
  
  -- Soft delete or anonymize business records
  UPDATE esg_reports SET created_by = NULL WHERE created_by = user_uuid;
  UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = user_uuid;
  UPDATE jobs SET created_by = NULL WHERE created_by = user_uuid;
  
  -- Mark organization memberships as deleted
  UPDATE organization_members 
  SET deleted_at = now() 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON FUNCTION auth_user_id IS 'Get current authenticated user ID';
COMMENT ON FUNCTION user_organizations IS 'Get all organizations for a user';
COMMENT ON FUNCTION update_updated_at IS 'Auto-update updated_at timestamp';
COMMENT ON FUNCTION soft_delete_report_cascade IS 'Cascade soft deletes from reports';
COMMENT ON FUNCTION gdpr_delete_user_data IS 'GDPR-compliant user data deletion';
```

## 019: Triggers
**File**: `20250101000018_create_triggers.sql`

```sql
-- Migration: Create Triggers
-- Description: Set up all database triggers

-- Auto-update timestamps for all tables with updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
      AND table_schema = 'public'
      AND table_name NOT LIKE '%_logs%' -- Skip log tables
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at 
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- Soft delete cascade trigger
CREATE TRIGGER cascade_report_soft_delete
  AFTER UPDATE ON esg_reports
  FOR EACH ROW
  WHEN (NEW.deleted_at IS DISTINCT FROM OLD.deleted_at)
  EXECUTE FUNCTION soft_delete_report_cascade();

-- Comments
COMMENT ON TRIGGER cascade_report_soft_delete ON esg_reports IS 'Cascade soft deletes to related records';
```

## 020: Row Level Security Policies
**File**: `20250101000019_create_rls_policies.sql`

```sql
-- Migration: Create Row Level Security Policies
-- Description: Implement multi-tenant data isolation

-- Enable RLS on all relevant tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_analysis_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY organizations_select ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM organization_members WHERE user_id = auth_user_id())
    OR (is_public = true AND deleted_at IS NULL)
  );

CREATE POLICY organizations_insert ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY organizations_update ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY organizations_delete ON organizations
  FOR DELETE USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role = 'owner'
    )
  );

-- Organization members policies
CREATE POLICY org_members_select ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

CREATE POLICY org_members_insert ON organization_members
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY org_members_update ON organization_members
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
    )
  );

-- Profiles policies
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    id = auth_user_id()
    OR id IN (
      SELECT user_id FROM organization_members
      WHERE organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
    )
  );

CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = auth_user_id());

-- Documents policies
CREATE POLICY documents_select ON documents
  FOR SELECT USING (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
    OR is_public = true
  );

CREATE POLICY documents_insert ON documents
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

CREATE POLICY documents_update ON documents
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY documents_delete ON documents
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
    )
  );

-- ESG Reports policies
CREATE POLICY esg_reports_select ON esg_reports
  FOR SELECT USING (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
    OR visibility = 'public'
  );

CREATE POLICY esg_reports_insert ON esg_reports
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY esg_reports_update ON esg_reports
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY esg_reports_delete ON esg_reports
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
    )
  );

-- ESG Analyses policies
CREATE POLICY esg_analyses_select ON esg_analyses
  FOR SELECT USING (
    report_id IN (
      SELECT id FROM esg_reports
      WHERE organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
        OR visibility = 'public'
    )
  );

CREATE POLICY esg_analyses_insert ON esg_analyses
  FOR INSERT WITH CHECK (
    report_id IN (
      SELECT id FROM esg_reports
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin', 'member')
      )
    )
  );

CREATE POLICY esg_analyses_update ON esg_analyses
  FOR UPDATE USING (
    report_id IN (
      SELECT id FROM esg_reports
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin', 'member')
      )
    )
  );

-- ESG Analysis Exports policies
CREATE POLICY esg_analysis_exports_select ON esg_analysis_exports
  FOR SELECT USING (
    analysis_id IN (
      SELECT a.id FROM esg_analyses a
      JOIN esg_reports r ON r.id = a.report_id
      WHERE r.organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
        OR r.visibility = 'public'
    )
  );

CREATE POLICY esg_analysis_exports_insert ON esg_analysis_exports
  FOR INSERT WITH CHECK (
    analysis_id IN (
      SELECT a.id FROM esg_analyses a
      JOIN esg_reports r ON r.id = a.report_id
      WHERE r.organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin', 'member')
      )
    )
  );

-- Jobs policies
CREATE POLICY jobs_select ON jobs
  FOR SELECT USING (
    organization_id IS NULL -- System jobs
    OR organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

CREATE POLICY jobs_insert ON jobs
  FOR INSERT WITH CHECK (
    organization_id IS NULL
    OR organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

CREATE POLICY jobs_update ON jobs
  FOR UPDATE USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
    )
  );

-- Activity logs policies
CREATE POLICY activity_logs_select ON activity_logs
  FOR SELECT USING (
    user_id = auth_user_id()
    OR organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY activity_logs_insert ON activity_logs
  FOR INSERT WITH CHECK (true); -- System can log any activity

-- Document access logs policies
CREATE POLICY document_access_logs_select ON document_access_logs
  FOR SELECT USING (
    user_id = auth_user_id()
    OR document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY document_access_logs_insert ON document_access_logs
  FOR INSERT WITH CHECK (true); -- System can log any access

-- Comments
COMMENT ON POLICY organizations_select ON organizations IS 'Users can see their organizations and public ones';
COMMENT ON POLICY esg_reports_select ON esg_reports IS 'Users can see their org reports and public ones';
```

## 021: Monitoring Views
**File**: `20250101000020_create_monitoring_views.sql`

```sql
-- Migration: Create Monitoring Views
-- Description: Views for system monitoring and analytics

-- Active queries view
CREATE VIEW active_queries AS
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  query_start,
  state,
  LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start;

-- Table sizes view
CREATE VIEW table_sizes AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size,
  pg_total_relation_size(schemaname||'.'||tablename) AS total_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage view
CREATE VIEW index_usage AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Job queue health view
CREATE VIEW job_queue_health AS
SELECT 
  kind,
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds,
  MAX(EXTRACT(EPOCH FROM (completed_at - started_at))) as max_duration_seconds,
  MIN(created_at) as oldest_job,
  MAX(created_at) as newest_job
FROM jobs
WHERE created_at > now() - interval '24 hours'
GROUP BY kind, status
ORDER BY kind, status;

-- Organization statistics view
CREATE VIEW organization_stats AS
SELECT 
  o.id,
  o.name,
  o.subscription_tier,
  COUNT(DISTINCT om.user_id) as member_count,
  COUNT(DISTINCT r.id) as report_count,
  COUNT(DISTINCT a.id) as analysis_count,
  COUNT(DISTINCT d.id) as document_count,
  MAX(r.created_at) as last_report_date,
  MAX(a.created_at) as last_analysis_date
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id AND om.accepted_at IS NOT NULL
LEFT JOIN esg_reports r ON r.organization_id = o.id AND r.deleted_at IS NULL
LEFT JOIN esg_analyses a ON a.report_id = r.id AND a.deleted_at IS NULL
LEFT JOIN documents d ON d.organization_id = o.id AND d.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.subscription_tier;

-- User activity summary view
CREATE VIEW user_activity_summary AS
SELECT 
  u.id,
  u.email,
  p.full_name,
  COUNT(DISTINCT al.id) as activity_count,
  COUNT(DISTINCT r.id) as reports_created,
  COUNT(DISTINCT a.id) as analyses_run,
  MAX(al.created_at) as last_activity,
  MIN(al.created_at) as first_activity
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN activity_logs al ON al.user_id = u.id
LEFT JOIN esg_reports r ON r.created_by = u.id
LEFT JOIN esg_analyses a ON a.report_id = r.id
GROUP BY u.id, u.email, p.full_name;

-- Comments
COMMENT ON VIEW active_queries IS 'Currently executing database queries';
COMMENT ON VIEW table_sizes IS 'Database table and index sizes';
COMMENT ON VIEW index_usage IS 'Index scan statistics';
COMMENT ON VIEW job_queue_health IS 'Job processing statistics';
COMMENT ON VIEW organization_stats IS 'Organization usage statistics';
COMMENT ON VIEW user_activity_summary IS 'User activity metrics';
```

## 022: Data Migration from Old Schema
**File**: `20250101000021_migrate_existing_data.sql`

```sql
-- Migration: Migrate Data from Old Schema
-- Description: Transfer data from existing tables to new structure

-- This migration assumes the old tables still exist
-- Adjust table/column names based on your actual schema

DO $$
DECLARE
  default_org_id uuid;
  framework_id uuid;
BEGIN
  -- Only run if we have old data to migrate
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'waitlist') THEN
    
    -- 1. Migrate waitlist entries
    INSERT INTO waitlist_entries (
      email, full_name, company_name, created_at, updated_at
    )
    SELECT 
      email, 
      name as full_name, 
      company as company_name,
      created_at,
      created_at as updated_at
    FROM waitlist
    ON CONFLICT (email) DO NOTHING;
    
    -- 2. Create default organization for existing data
    INSERT INTO organizations (name, slug, subscription_tier)
    VALUES ('Default Organization', 'default-org', 'free')
    RETURNING id INTO default_org_id;
    
    -- 3. Link existing users to default organization
    INSERT INTO organization_members (organization_id, user_id, role, accepted_at)
    SELECT 
      default_org_id,
      u.id,
      'owner',
      now()
    FROM auth.users u
    WHERE EXISTS (
      SELECT 1 FROM esg_reports r WHERE r.user_id = u.id
    )
    ON CONFLICT DO NOTHING;
    
    -- 4. Migrate documents if they exist as separate table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
      INSERT INTO documents (
        organization_id, uploaded_by, file_name, file_type, 
        file_size, storage_path, created_at, updated_at
      )
      SELECT 
        default_org_id,
        user_id,
        filename,
        COALESCE(file_type, 'application/pdf'),
        COALESCE(file_size, 0),
        storage_path,
        created_at,
        created_at
      FROM documents
      ON CONFLICT (storage_path) DO NOTHING;
    END IF;
    
    -- 5. Migrate ESG reports
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'esg_reports') THEN
      -- First, ensure we have the GRI framework
      INSERT INTO esg_frameworks (code, name, version)
      VALUES ('GRI', 'Global Reporting Initiative', '2021')
      ON CONFLICT (code) DO UPDATE SET id = esg_frameworks.id
      RETURNING id INTO framework_id;
      
      -- Migrate reports
      INSERT INTO esg_reports (
        id, organization_id, created_by, title, report_type,
        reporting_period_start, reporting_period_end, 
        framework, status, created_at, updated_at
      )
      SELECT 
        r.id,
        default_org_id,
        r.user_id,
        COALESCE(r.report_title, 'Untitled Report'),
        COALESCE(r.report_type, 'sustainability'),
        r.reporting_period_start,
        r.reporting_period_end,
        'GRI',
        COALESCE(r.status, 'draft'),
        r.created_at,
        COALESCE(r.updated_at, r.created_at)
      FROM esg_reports r
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- 6. Migrate ESG analyses
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'esg_report_analyses') THEN
      INSERT INTO esg_analyses (
        report_id, analysis_version, framework_used, ai_model,
        full_analysis, is_latest, created_at, updated_at
      )
      SELECT 
        report_id,
        ROW_NUMBER() OVER (PARTITION BY report_id ORDER BY created_at) as version,
        COALESCE(framework, 'GRI'),
        'gpt-4',
        analysis_data,
        ROW_NUMBER() OVER (PARTITION BY report_id ORDER BY created_at DESC) = 1,
        created_at,
        COALESCE(updated_at, created_at)
      FROM esg_report_analyses
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- 7. Migrate guideline embeddings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'esg_guideline_chunks') THEN
      -- Create guidelines first
      INSERT INTO esg_guidelines (framework_id, code, title, category)
      SELECT DISTINCT
        framework_id,
        COALESCE(code, 'LEGACY-' || row_number() OVER ()),
        title,
        'general'
      FROM esg_guideline_chunks
      ON CONFLICT DO NOTHING;
      
      -- Then migrate embeddings
      INSERT INTO esg_guideline_embeddings (
        guideline_id, chunk_index, content, embedding
      )
      SELECT 
        g.id,
        ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY c.created_at),
        c.content,
        c.embedding
      FROM esg_guideline_chunks c
      JOIN esg_guidelines g ON g.title = c.title
      ON CONFLICT DO NOTHING;
    END IF;
    
  END IF;
END $$;

-- Comments
COMMENT ON SCHEMA public IS 'Migration completed from legacy schema';
```

## 023: Performance Optimization
**File**: `20250101000022_performance_optimization.sql`

```sql
-- Migration: Performance Optimization
-- Description: Final performance tuning and optimization

-- Update table statistics
ANALYZE organizations;
ANALYZE organization_members;
ANALYZE profiles;
ANALYZE documents;
ANALYZE esg_reports;
ANALYZE esg_analyses;
ANALYZE esg_analysis_exports;
ANALYZE jobs;
ANALYZE esg_frameworks;
ANALYZE esg_guidelines;
ANALYZE esg_guideline_embeddings;

-- Configure autovacuum for high-traffic tables
ALTER TABLE activity_logs SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE document_access_logs SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE jobs SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE esg_analyses SET (autovacuum_vacuum_scale_factor = 0.1);

-- Set fillfactor for frequently updated tables
ALTER TABLE jobs SET (fillfactor = 80);
ALTER TABLE esg_analyses SET (fillfactor = 90);
ALTER TABLE activity_logs SET (fillfactor = 95);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reports_org_status_period 
  ON esg_reports(organization_id, status, reporting_period_start DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_analyses_report_latest 
  ON esg_analyses(report_id, is_latest) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_ready_composite 
  ON jobs(status, scheduled_for, priority DESC) 
  WHERE status IN ('pending', 'failed');

-- Vector search optimization
SET ivfflat.probes = 10;

-- Create materialized view for expensive aggregations
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_organization_metrics AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  o.subscription_tier,
  COUNT(DISTINCT om.user_id) as total_members,
  COUNT(DISTINCT r.id) as total_reports,
  COUNT(DISTINCT a.id) as total_analyses,
  AVG(a.overall_score) as avg_esg_score,
  MAX(r.created_at) as last_report_date,
  MAX(a.created_at) as last_analysis_date,
  SUM(d.file_size) as total_storage_bytes
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id 
  AND om.accepted_at IS NOT NULL
LEFT JOIN esg_reports r ON r.organization_id = o.id 
  AND r.deleted_at IS NULL
LEFT JOIN esg_analyses a ON a.report_id = r.id 
  AND a.deleted_at IS NULL 
  AND a.is_latest = true
LEFT JOIN documents d ON d.organization_id = o.id 
  AND d.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.subscription_tier;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_mv_org_metrics_org ON mv_organization_metrics(organization_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_organization_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_organization_metrics;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON MATERIALIZED VIEW mv_organization_metrics IS 'Pre-computed organization metrics for dashboards';
```

## 024: Cleanup Old Schema
**File**: `20250101000023_cleanup_old_schema.sql`

```sql
-- Migration: Cleanup Old Schema
-- Description: Remove old tables and clean up after migration
-- WARNING: Only run after confirming data migration is successful!

-- Create backup schema for old tables
CREATE SCHEMA IF NOT EXISTS legacy_backup;

-- Move old tables to backup schema (if they exist)
DO $$
DECLARE
  old_tables text[] := ARRAY[
    'waitlist',
    'esg_report_analyses',
    'esg_guideline_frameworks',
    'esg_guideline_chunks',
    'document_access_logs_old',
    'feature_flags_old'
  ];
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY old_tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = tbl
    ) THEN
      EXECUTE format('ALTER TABLE public.%I SET SCHEMA legacy_backup', tbl);
      RAISE NOTICE 'Moved table % to legacy_backup schema', tbl;
    END IF;
  END LOOP;
END $$;

-- Drop old/unused indexes
DROP INDEX IF EXISTS idx_waitlist_email;
DROP INDEX IF EXISTS idx_waitlist_created_at;

-- Clean up orphaned sequences
DO $$
DECLARE
  seq record;
BEGIN
  FOR seq IN 
    SELECT sequence_name 
    FROM information_schema.sequences 
    WHERE sequence_schema = 'public'
      AND sequence_name NOT IN (
        SELECT pg_get_serial_sequence(table_name, column_name)
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_default LIKE 'nextval%'
      )
  LOOP
    EXECUTE format('DROP SEQUENCE IF EXISTS %I CASCADE', seq.sequence_name);
  END LOOP;
END $$;

-- Vacuum and reindex
VACUUM ANALYZE;
REINDEX DATABASE CURRENT_DATABASE;

-- Final statistics update
ANALYZE;

-- Comments
COMMENT ON SCHEMA legacy_backup IS 'Backup of old tables before migration - can be dropped after verification';
```

## Summary

This completes the full set of SQL migrations needed to implement the new database schema. The migrations are designed to be run in order and include:

1. **Foundation** (001-006): Core tables for multi-tenancy
2. **Business Logic** (007-010): ESG reports and analysis tables
3. **Knowledge Base** (011-013): Guidelines and vector search
4. **Monitoring** (014-016): Logging and feature flags
5. **Functions & Security** (017-020): Helper functions, triggers, and RLS
6. **Operations** (021-024): Monitoring views, data migration, and cleanup

To implement these migrations:

1. Copy each SQL block to a file with the suggested filename
2. Run them in order using Supabase CLI: `supabase db push`
3. Verify each migration before proceeding to the next
4. Test RLS policies and functions thoroughly
5. Run the data migration only after backing up existing data
6. Keep the legacy_backup schema until you're confident in the new structure

Remember to update your edge functions and frontend code to work with the new schema structure!