-- Fix SECURITY DEFINER views by explicitly setting them to SECURITY INVOKER
-- This ensures views run with caller permissions and respect RLS policies

-- Drop and recreate organization_stats view with SECURITY INVOKER
DROP VIEW IF EXISTS public.organization_stats;

CREATE VIEW public.organization_stats 
WITH (security_invoker = on) AS
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
  AND (
    -- User can see their own organizations
    o.id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
        AND accepted_at IS NOT NULL
        AND deleted_at IS NULL
    )
    OR
    -- Admins can see all organizations
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
GROUP BY o.id, o.name, o.subscription_tier;

-- Drop and recreate organization_metrics view with SECURITY INVOKER
DROP VIEW IF EXISTS public.organization_metrics;

CREATE VIEW public.organization_metrics
WITH (security_invoker = on) AS
SELECT 
  o.id AS organization_id,
  o.name AS organization_name,
  o.subscription_tier,
  COUNT(DISTINCT om.user_id) FILTER (WHERE om.accepted_at IS NOT NULL AND om.deleted_at IS NULL) AS total_members,
  COUNT(DISTINCT r.id) FILTER (WHERE r.deleted_at IS NULL) AS total_reports,
  COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL) AS total_analyses,
  AVG(a.overall_score) FILTER (WHERE a.deleted_at IS NULL AND a.is_latest = true) AS avg_esg_score,
  MAX(r.created_at) FILTER (WHERE r.deleted_at IS NULL) AS last_report_date,
  MAX(a.created_at) FILTER (WHERE a.deleted_at IS NULL) AS last_analysis_date,
  COALESCE(SUM(d.file_size) FILTER (WHERE d.deleted_at IS NULL), 0) AS total_storage_bytes
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id
LEFT JOIN esg_reports r ON r.organization_id = o.id
LEFT JOIN esg_analyses a ON a.report_id = r.id
LEFT JOIN documents d ON d.organization_id = o.id
WHERE o.deleted_at IS NULL
  AND (
    -- User can see their own organizations
    o.id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
        AND accepted_at IS NOT NULL
        AND deleted_at IS NULL
    )
    OR
    -- Admins can see all organizations
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
GROUP BY o.id, o.name, o.subscription_tier;

-- Add comments to document the security model
COMMENT ON VIEW public.organization_stats IS 'Organization statistics with SECURITY INVOKER - respects caller permissions and RLS policies';
COMMENT ON VIEW public.organization_metrics IS 'Organization metrics with SECURITY INVOKER - respects caller permissions and RLS policies';