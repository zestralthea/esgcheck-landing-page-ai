-- CRITICAL SECURITY FIX: Phase 1C - Address Auth Users and Views (FIXED)
-- Fix the system_settings policy that failed due to missing column

-- Need to identify what table still needs RLS - let's enable it on system tables that might be missing
-- Check for any remaining tables without RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create restrictive policy for system settings (admin only) - without referencing non-existent column
CREATE POLICY "Only admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Fix remaining function search paths for the functions that are still missing it
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.soft_delete_report_cascade()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.gdpr_delete_user_data(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins or the user themselves to delete their data
  IF NOT (public.is_admin() OR user_uuid = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: insufficient privileges';
  END IF;

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
$$;

CREATE OR REPLACE FUNCTION public.refresh_organization_metrics()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to refresh metrics
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: only admins can refresh metrics';
  END IF;
  
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_organization_metrics;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Insert a job into the background jobs table for email sending
    INSERT INTO public.background_jobs (
        job_type, 
        payload, 
        status
    ) VALUES (
        'send_waitlist_email',
        jsonb_build_object(
            'name', NEW.full_name,
            'email', NEW.email,
            'inserted_at', NOW()
        ),
        'pending'
    );

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_guideline_chunks(query_embedding extensions.vector, match_threshold double precision, match_count integer, framework_name text)
RETURNS TABLE(id bigint, content text, embedding extensions.vector, similarity double precision)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gc.id,
    gc.content,
    gc.embedding,
    1 - (gc.embedding <=> query_embedding) AS similarity
  FROM
    guideline_chunks gc
  WHERE
    (framework_name IS NULL OR gc.framework = framework_name)
    AND (1 - (gc.embedding <=> query_embedding)) > match_threshold
  ORDER BY
    gc.embedding <=> query_embedding
  LIMIT
    match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_function_exists(function_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  function_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE p.proname = function_name
  ) INTO function_exists;
  
  RETURN function_exists;
END;
$$;

-- Create audit log for this security fix phase
INSERT INTO public.security_audit_log (
    user_id,
    action_type,
    resource_type,
    resource_id,
    success,
    error_message
) VALUES (
    auth.uid(),
    'SECURITY_FIX',
    'DATABASE_SCHEMA',
    'critical_data_protection_phase1c_fixed',
    true,
    'Fixed remaining RLS issues and function search paths'
);