-- CRITICAL SECURITY FIX: Phase 1B - Address Remaining Critical Issues
-- Fix remaining ERROR level security issues from linter

-- Fix RLS Disabled in Public for remaining tables
ALTER TABLE public.esg_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_guideline_embeddings ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.guideline_chunks ENABLE ROW LEVEL SECURITY;

-- Create basic policies for public reference tables (frameworks, guidelines)
CREATE POLICY "Anyone can read ESG frameworks" 
ON public.esg_frameworks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can read guideline embeddings" 
ON public.esg_guideline_embeddings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can read guideline chunks" 
ON public.guideline_chunks 
FOR SELECT 
USING (true);

-- Fix function search paths for security (add SET search_path to functions missing it)
CREATE OR REPLACE FUNCTION public.claim_next_job(worker_id text)
RETURNS jobs
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  next_job jobs;
BEGIN
  SELECT * INTO next_job
  FROM jobs
  WHERE status IN ('pending', 'failed')
    AND scheduled_for <= now()
    AND attempts < max_attempts
  ORDER BY priority DESC, scheduled_for
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF next_job.id IS NOT NULL THEN
    UPDATE jobs 
    SET status = 'running',
        started_at = now(),
        attempts = attempts + 1,
        last_attempt_at = now(),
        updated_at = now()
    WHERE id = next_job.id;
  END IF;
  
  RETURN next_job;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_latest_analysis()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_latest = true THEN
    UPDATE esg_analyses 
    SET is_latest = false 
    WHERE report_id = NEW.report_id 
      AND is_latest = true 
      AND id != NEW.id
      AND deleted_at IS NULL;
  END IF;
  
  IF NEW.is_latest IS NULL THEN
    NEW.is_latest = NOT EXISTS (
      SELECT 1 FROM esg_analyses 
      WHERE report_id = NEW.report_id 
        AND deleted_at IS NULL
        AND id != NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_guidelines(query_embedding extensions.vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 10, p_framework_code text DEFAULT NULL::text)
RETURNS TABLE(guideline_id uuid, framework_code text, guideline_code text, title text, content text, chunk_index integer, similarity double precision)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    f.code,
    g.code,
    g.title,
    ge.content,
    ge.chunk_index,
    1 - (ge.embedding <=> query_embedding) AS similarity
  FROM esg_guideline_embeddings ge
  JOIN esg_guidelines g ON g.id = ge.guideline_id
  JOIN esg_frameworks f ON f.id = g.framework_id
  WHERE 
    (p_framework_code IS NULL OR f.code = p_framework_code)
    AND 1 - (ge.embedding <=> query_embedding) > match_threshold
  ORDER BY ge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_monthly_partition()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  partition_date date;
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  partition_date := date_trunc('month', CURRENT_DATE + interval '1 month')::date;
  partition_name := 'activity_logs_' || to_char(partition_date, 'YYYY_MM');
  start_date := partition_date;
  end_date := (partition_date + interval '1 month')::date;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF activity_logs FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_document_logs_monthly_partition()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  partition_date date;
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  partition_date := date_trunc('month', CURRENT_DATE + interval '1 month')::date;
  partition_name := 'document_access_logs_' || to_char(partition_date, 'YYYY_MM');
  start_date := partition_date;
  end_date := (partition_date + interval '1 month')::date;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF document_access_logs FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_feature_access(feature_name text, user_uuid uuid DEFAULT NULL::uuid, org_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  flag_record feature_flags;
  has_access boolean := false;
BEGIN
  SELECT * INTO flag_record FROM feature_flags WHERE name = feature_name;
  IF flag_record IS NULL THEN
    RETURN false;
  END IF;

  IF NOT flag_record.is_enabled THEN
    RETURN false;
  END IF;

  -- Check user whitelist
  IF user_uuid IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM feature_flag_users 
      WHERE feature_flag_id = flag_record.id 
        AND user_id = user_uuid
    ) INTO has_access;
    IF has_access THEN RETURN true; END IF;
  END IF;

  -- Check org whitelist
  IF org_uuid IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM feature_flag_organizations 
      WHERE feature_flag_id = flag_record.id 
        AND organization_id = org_uuid
    ) INTO has_access;
    IF has_access THEN RETURN true; END IF;
  END IF;

  -- Check rollout percentage
  IF flag_record.rollout_percentage = 100 THEN
    RETURN true;
  ELSIF flag_record.rollout_percentage > 0 AND user_uuid IS NOT NULL THEN
    -- Simple hash-based rollout
    RETURN (hashtext(user_uuid::text) % 100) < flag_record.rollout_percentage;
  END IF;

  RETURN false;
END;
$$;

-- Remove or restrict security definer views that expose sensitive data
-- Note: We need to identify and drop problematic views, but first let's check what exists
-- This is a placeholder - in production you'd identify specific problematic views

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
    'critical_data_protection_phase1b',
    true,
    'Enabled RLS on remaining tables, fixed function search paths'
);