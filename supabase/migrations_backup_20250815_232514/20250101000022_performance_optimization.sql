-- Migration: Performance Optimization & Metrics
-- Description: Statistics, autovacuum tuning, composite indexes, materialized views

-- Update statistics for core tables
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

-- Autovacuum tuning for high-write tables (adjust as needed)
ALTER TABLE activity_logs SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE document_access_logs SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE jobs SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE esg_analyses SET (autovacuum_vacuum_scale_factor = 0.1);

-- Set fillfactor for frequently updated tables
ALTER TABLE jobs SET (fillfactor = 80);
ALTER TABLE esg_analyses SET (fillfactor = 90);
ALTER TABLE activity_logs SET (fillfactor = 95);
ALTER TABLE document_access_logs SET (fillfactor = 95);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_reports_org_status_period 
  ON esg_reports(organization_id, status, reporting_period_start DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_analyses_report_latest 
  ON esg_analyses(report_id, is_latest) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_ready_composite 
  ON jobs(status, scheduled_for, priority DESC) 
  WHERE status IN ('pending', 'failed');

-- Vector search tuning (set session-level in clients as well)
-- SET ivfflat.probes = 10;

-- Materialized view for organization metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_organization_metrics AS
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_org_metrics_org ON mv_organization_metrics(organization_id);

-- Refresh helper for materialized view
CREATE OR REPLACE FUNCTION refresh_organization_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_organization_metrics;
END;
$$ LANGUAGE plpgsql;

COMMENT ON MATERIALIZED VIEW mv_organization_metrics IS 'Pre-computed organization metrics for dashboards';
COMMENT ON FUNCTION refresh_organization_metrics IS 'Refreshes mv_organization_metrics concurrently';