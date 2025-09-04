-- FINAL SECURITY FIX - Remove problematic views and materialized view
-- Drop monitoring views that expose sensitive system information

-- 1. DROP SECURITY-SENSITIVE MONITORING VIEWS
-- These views expose sensitive database performance and system information
DROP VIEW IF EXISTS public.active_queries;
DROP VIEW IF EXISTS public.table_sizes;
DROP VIEW IF EXISTS public.job_queue_health;
DROP VIEW IF EXISTS public.index_usage;

-- Keep organization_stats but make it more secure by limiting data exposure
DROP VIEW IF EXISTS public.organization_stats;
CREATE VIEW public.organization_stats AS
SELECT 
  o.id AS organization_id,
  o.name AS organization_name,
  o.subscription_tier,
  COUNT(DISTINCT om.user_id) FILTER (WHERE om.accepted_at IS NOT NULL AND om.deleted_at IS NULL) AS member_count,
  COUNT(DISTINCT r.id) FILTER (WHERE r.deleted_at IS NULL) AS report_count,
  COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL) AS analysis_count,
  COUNT(DISTINCT d.id) FILTER (WHERE d.deleted_at IS NULL) AS document_count,
  MAX(r.created_at) FILTER (WHERE r.deleted_at IS NULL) AS last_report_created_at,
  MAX(a.created_at) FILTER (WHERE a.deleted_at IS NULL) AS last_analysis_created_at,
  COALESCE(SUM(d.file_size) FILTER (WHERE d.deleted_at IS NULL), 0) AS total_storage_bytes
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id
LEFT JOIN esg_reports r ON r.organization_id = o.id
LEFT JOIN esg_analyses a ON a.report_id = r.id
LEFT JOIN documents d ON d.organization_id = o.id
WHERE o.deleted_at IS NULL
  -- Only show organizations the current user has access to
  AND (
    o.id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
        AND accepted_at IS NOT NULL 
        AND deleted_at IS NULL
    )
    OR o.is_public = true
  )
GROUP BY o.id, o.name, o.subscription_tier;

-- 2. CONVERT MATERIALIZED VIEW TO REGULAR VIEW
-- Drop the problematic materialized view and recreate as regular view
DROP MATERIALIZED VIEW IF EXISTS public.mv_organization_metrics;

-- Create as regular view with built-in access control
CREATE VIEW public.organization_metrics AS
SELECT 
  o.id AS organization_id,
  o.name AS organization_name,
  o.subscription_tier,
  COUNT(DISTINCT om.user_id) FILTER (WHERE om.accepted_at IS NOT NULL AND om.deleted_at IS NULL) AS total_members,
  COUNT(DISTINCT r.id) FILTER (WHERE r.deleted_at IS NULL) AS total_reports,
  COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL) AS total_analyses,
  AVG(a.overall_score) FILTER (WHERE a.is_latest = true AND a.deleted_at IS NULL) AS avg_esg_score,
  MAX(r.created_at) FILTER (WHERE r.deleted_at IS NULL) AS last_report_date,
  MAX(a.created_at) FILTER (WHERE a.deleted_at IS NULL) AS last_analysis_date,
  COALESCE(SUM(d.file_size) FILTER (WHERE d.deleted_at IS NULL), 0) AS total_storage_bytes
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id
LEFT JOIN esg_reports r ON r.organization_id = o.id
LEFT JOIN esg_analyses a ON a.report_id = r.id
LEFT JOIN documents d ON d.organization_id = o.id
WHERE o.deleted_at IS NULL
  -- Only show organizations the current user has access to
  AND (
    o.id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
        AND accepted_at IS NOT NULL 
        AND deleted_at IS NULL
    )
    OR o.is_public = true
  )
GROUP BY o.id, o.name, o.subscription_tier;

-- 3. ADD DOCUMENTATION
COMMENT ON VIEW public.organization_stats IS 'Organization statistics with built-in access control';
COMMENT ON VIEW public.organization_metrics IS 'Organization metrics with built-in access control (replaces materialized view)';

-- 4. CREATE SECURE ADMIN-ONLY FUNCTIONS FOR MONITORING (if needed)
-- These functions can only be called by admin users and don't expose data via API

CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admin users to access system statistics
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  
  RETURN json_build_object(
    'total_organizations', (SELECT COUNT(*) FROM organizations WHERE deleted_at IS NULL),
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_reports', (SELECT COUNT(*) FROM esg_reports WHERE deleted_at IS NULL),
    'system_uptime', 'Available via admin dashboard only'
  );
END;
$$;

-- Log the security improvements
SELECT public.log_security_event(
    'monitoring_views_secured',
    'database_migration',
    'dropped_sensitive_views',
    true,
    'Removed sensitive monitoring views and converted materialized view to secure regular view'
);