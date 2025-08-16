-- Migration: Create Monitoring Views
-- Description: Views for system monitoring, diagnostics, and org/user analytics

-- Active queries (avoid self-reference)
CREATE OR REPLACE VIEW active_queries AS
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  NOW() - query_start AS duration,
  LEFT(query, 200) AS query_preview
FROM pg_stat_activity
WHERE state <> 'idle'
  AND query NOT ILIKE '%FROM active_queries%'
ORDER BY query_start;

COMMENT ON VIEW active_queries IS 'Currently executing database queries with preview and duration';


-- Table sizes (public schema)
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
  schemaname,
  tablename,
  pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) AS total_bytes,
  pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) AS table_bytes,
  pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) 
    - pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) AS index_bytes,
  pg_size_pretty(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS total_size_pretty,
  pg_size_pretty(pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS table_size_pretty,
  pg_size_pretty(
    pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) 
    - pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))
  ) AS index_size_pretty
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY total_bytes DESC;

COMMENT ON VIEW table_sizes IS 'Sizes for public schema tables and their indexes';


-- Index usage summary
CREATE OR REPLACE VIEW index_usage AS
SELECT 
  s.schemaname,
  s.relname AS tablename,
  i.indexrelname AS indexname,
  i.idx_scan,
  i.idx_tup_read,
  i.idx_tup_fetch,
  pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size
FROM pg_stat_user_indexes i
JOIN pg_stat_user_tables s ON s.relid = i.relid
ORDER BY i.idx_scan DESC, i.idx_tup_read DESC;

COMMENT ON VIEW index_usage IS 'Index scan statistics and index sizes';


-- Job queue health (last 24h)
CREATE OR REPLACE VIEW job_queue_health AS
SELECT 
  kind,
  status,
  COUNT(*) AS count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (WHERE completed_at IS NOT NULL AND started_at IS NOT NULL) AS avg_duration_seconds,
  MAX(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (WHERE completed_at IS NOT NULL AND started_at IS NOT NULL) AS max_duration_seconds,
  MIN(created_at) AS oldest_job_created_at,
  MAX(created_at) AS newest_job_created_at
FROM jobs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY kind, status
ORDER BY kind, status;

COMMENT ON VIEW job_queue_health IS 'Job processing counts and durations over the last 24 hours';


-- Organization-level metrics
CREATE OR REPLACE VIEW organization_stats AS
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
GROUP BY o.id, o.name, o.subscription_tier;

COMMENT ON VIEW organization_stats IS 'Per-organization usage and activity metrics';


-- User activity summary (joined with profiles if available)
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.id AS user_id,
  u.email,
  p.full_name,
  COUNT(DISTINCT al.id) AS activity_count,
  COUNT(DISTINCT r.id) AS reports_created,
  COUNT(DISTINCT a.id) AS analyses_run,
  MAX(al.created_at) AS last_activity_at,
  MIN(al.created_at) AS first_activity_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN activity_logs al ON al.user_id = u.id
LEFT JOIN esg_reports r ON r.created_by = u.id
LEFT JOIN esg_analyses a ON a.report_id = r.id
GROUP BY u.id, u.email, p.full_name;

COMMENT ON VIEW user_activity_summary IS 'Aggregate view of per-user activity and authored content';