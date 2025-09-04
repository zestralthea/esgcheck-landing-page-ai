-- Address remaining security issues
-- Add RLS policies for monitoring views and handle materialized view

-- 1. ENABLE RLS ON MONITORING VIEWS AND ADD ADMIN-ONLY POLICIES
ALTER VIEW public.active_queries ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.table_sizes ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.job_queue_health ENABLE ROW LEVEL SECURITY; 
ALTER VIEW public.index_usage ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.organization_stats ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies for monitoring views
CREATE POLICY "Admins only can view active queries"
ON public.active_queries FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins only can view table sizes"
ON public.table_sizes FOR SELECT  
USING (public.is_admin());

CREATE POLICY "Admins only can view job queue health"
ON public.job_queue_health FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins only can view index usage"
ON public.index_usage FOR SELECT
USING (public.is_admin());

-- Organization stats can be viewed by organization members
CREATE POLICY "Users can view their organization stats"
ON public.organization_stats FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
      AND accepted_at IS NOT NULL 
      AND deleted_at IS NULL
  )
  OR public.is_admin()
);

-- 2. CONVERT MATERIALIZED VIEW TO REGULAR VIEW (to avoid RLS limitation)
-- Drop the problematic materialized view and recreate as regular view
DROP MATERIALIZED VIEW IF EXISTS public.mv_organization_metrics;

-- Create as regular view with RLS support
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
GROUP BY o.id, o.name, o.subscription_tier;

-- Enable RLS on the new view
ALTER VIEW public.organization_metrics ENABLE ROW LEVEL SECURITY;

-- Add policy for organization metrics
CREATE POLICY "Users can view their organization metrics"
ON public.organization_metrics FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
      AND accepted_at IS NOT NULL 
      AND deleted_at IS NULL
  )
  OR public.is_admin()
);

-- 3. ADD DOCUMENTATION
COMMENT ON VIEW public.organization_metrics IS 'Organization metrics view with proper RLS (replaces materialized view)';

-- Log the security improvements
SELECT public.log_security_event(
    'rls_policies_added_monitoring_views',
    'database_migration',
    'monitoring_views_secured',
    true,
    'Added RLS policies to monitoring views and converted materialized view to regular view'
);