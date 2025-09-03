# Database Maintenance Guide

## Overview
Operational procedures for maintaining the ESGCheck production database with 30+ tables, partitioned logging, and materialized views.

## Routine Maintenance Tasks

### Daily Operations

#### 1. Health Monitoring
```sql
-- Check active connections and long-running queries
SELECT * FROM active_queries WHERE duration > interval '5 minutes';

-- Monitor table sizes for unusual growth
SELECT * FROM table_sizes ORDER BY size_bytes DESC LIMIT 10;

-- Check job queue health
SELECT * FROM job_queue_health WHERE status IN ('failed', 'pending') AND count > 10;
```

#### 2. Performance Monitoring
```sql
-- Check index usage efficiency
SELECT * FROM index_usage WHERE idx_scan = 0 ORDER BY index_size DESC;

-- Monitor partition performance
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del 
FROM pg_stat_user_tables 
WHERE tablename LIKE '%_2025_%' 
ORDER BY n_tup_ins DESC;
```

### Weekly Operations

#### 1. Materialized View Refresh
```sql
-- Refresh organization metrics (concurrent for zero downtime)
SELECT refresh_organization_metrics();

-- Check refresh status
SELECT schemaname, matviewname, ispopulated, last_refresh 
FROM pg_matviews 
WHERE matviewname = 'mv_organization_metrics';
```

#### 2. Partition Maintenance
```sql
-- Create next month's partitions
SELECT create_monthly_partition();
SELECT create_document_logs_monthly_partition();

-- Verify partition creation
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename ~ '^(activity_logs|document_access_logs)_[0-9]{4}_[0-9]{2}$'
ORDER BY tablename DESC;
```

### Monthly Operations

#### 1. Partition Cleanup
```sql
-- Identify old partitions (older than 12 months)
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename ~ '^(activity_logs|document_access_logs)_[0-9]{4}_[0-9]{2}$'
AND tablename < 'activity_logs_' || to_char(now() - interval '12 months', 'YYYY_MM');

-- Archive old partitions (replace with actual archive procedure)
-- Example: Export to external storage before dropping
-- DROP TABLE activity_logs_2024_01;
-- DROP TABLE document_access_logs_2024_01;
```

#### 2. Statistics Update
```sql
-- Update table statistics for query optimization
ANALYZE organizations;
ANALYZE esg_reports;
ANALYZE esg_analyses;
ANALYZE documents;
ANALYZE jobs;

-- Update all table statistics
ANALYZE;
```

#### 3. Index Maintenance
```sql
-- Reindex heavily used tables
REINDEX TABLE esg_reports;
REINDEX TABLE esg_analyses;
REINDEX TABLE documents;

-- Reindex vector indexes for optimal performance
REINDEX INDEX idx_embeddings_vector;
```

## Backup Procedures

### Automated Backups (Supabase Managed)
Supabase provides automated backups, but verify configuration:

```sql
-- Check backup status via Supabase Dashboard
-- Project Settings > Database > Backups
```

### Manual Backup Procedures

#### 1. Schema-Only Backup
```bash
# Export schema structure
pg_dump --host=db.xxx.supabase.co \
        --port=5432 \
        --username=postgres \
        --dbname=postgres \
        --schema-only \
        --file=esgcheck_schema_$(date +%Y%m%d).sql
```

#### 2. Data-Only Backup (Selective)
```bash
# Backup critical configuration data
pg_dump --host=db.xxx.supabase.co \
        --port=5432 \
        --username=postgres \
        --dbname=postgres \
        --data-only \
        --table=system_settings \
        --table=esg_frameworks \
        --table=feature_flags \
        --file=esgcheck_config_$(date +%Y%m%d).sql
```

#### 3. Organization-Specific Backup
```sql
-- Export specific organization data
COPY (
  SELECT row_to_json(t) FROM (
    SELECT * FROM organizations WHERE id = 'org-uuid-here'
  ) t
) TO '/tmp/org_backup.json';
```

## Performance Optimization

### Query Performance Monitoring

#### 1. Slow Query Analysis
```sql
-- Enable slow query logging (if not already enabled)
-- ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 second
-- SELECT pg_reload_conf();

-- Check for slow queries in logs
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### 2. Index Optimization
```sql
-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats 
WHERE schemaname = 'public' 
AND n_distinct > 100 
AND correlation < 0.1;

-- Monitor index bloat
SELECT schemaname, tablename, indexname, 
       pg_size_pretty(pg_relation_size(indexname)) as index_size,
       idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan < 10 AND pg_relation_size(indexname) > 1024*1024; -- 1MB
```

### Vector Search Optimization

#### 1. Vector Index Maintenance
```sql
-- Monitor vector index performance
SELECT count(*) as embedding_count,
       avg(array_length(embedding::real[], 1)) as avg_dimensions
FROM esg_guideline_embeddings;

-- Rebuild vector index if performance degrades
REINDEX INDEX idx_embeddings_vector;
```

#### 2. Vector Search Parameter Tuning
```sql
-- Adjust IVFFlat parameters based on data size
-- For tables with >100k vectors, consider increasing lists
-- ALTER INDEX idx_embeddings_vector SET (lists = 200);
```

## Data Retention and Archival

### Audit Log Retention

#### 1. Partition-Based Retention
```sql
-- Retention policy: Keep 12 months of activity logs
CREATE OR REPLACE FUNCTION cleanup_old_partitions()
RETURNS void AS $$
DECLARE
  partition_name text;
  cutoff_date text;
BEGIN
  cutoff_date := to_char(now() - interval '12 months', 'YYYY_MM');
  
  FOR partition_name IN 
    SELECT tablename FROM pg_tables 
    WHERE tablename ~ '^activity_logs_[0-9]{4}_[0-9]{2}$'
    AND tablename < 'activity_logs_' || cutoff_date
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', partition_name);
    RAISE NOTICE 'Dropped partition: %', partition_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly cleanup
-- SELECT cleanup_old_partitions();
```

#### 2. Document Access Log Retention
```sql
-- Similar cleanup for document access logs
CREATE OR REPLACE FUNCTION cleanup_document_log_partitions()
RETURNS void AS $$
DECLARE
  partition_name text;
  cutoff_date text;
BEGIN
  cutoff_date := to_char(now() - interval '24 months', 'YYYY_MM'); -- Longer retention for compliance
  
  FOR partition_name IN 
    SELECT tablename FROM pg_tables 
    WHERE tablename ~ '^document_access_logs_[0-9]{4}_[0-9]{2}$'
    AND tablename < 'document_access_logs_' || cutoff_date
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', partition_name);
    RAISE NOTICE 'Dropped document log partition: %', partition_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### Data Archival Procedures

#### 1. Organization Data Archival
```sql
-- Archive deleted organizations after 90 days
CREATE OR REPLACE FUNCTION archive_deleted_organizations()
RETURNS integer AS $$
DECLARE
  archived_count integer := 0;
  org_record record;
BEGIN
  FOR org_record IN 
    SELECT id FROM organizations 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < now() - interval '90 days'
  LOOP
    -- Archive organization data to external storage
    -- Implementation depends on archival system
    
    -- After successful archival, remove from database
    DELETE FROM organizations WHERE id = org_record.id;
    archived_count := archived_count + 1;
  END LOOP;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

## Security Maintenance

### RLS Policy Validation

#### 1. Policy Coverage Check
```sql
-- Ensure all tables have RLS enabled
SELECT schemaname, tablename, 
       CASE WHEN rowsecurity THEN 'Enabled' ELSE 'DISABLED' END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
AND c.relkind = 'r'
ORDER BY rls_status, tablename;
```

#### 2. Policy Effectiveness Testing
```sql
-- Test cross-tenant access prevention
-- Run as different users to verify isolation
SET ROLE test_user_org_a;
SELECT count(*) FROM esg_reports; -- Should only see org A data

SET ROLE test_user_org_b;  
SELECT count(*) FROM esg_reports; -- Should only see org B data
```

### Access Control Audit

#### 1. Admin Access Review
```sql
-- List all admin users
SELECT p.id, p.email, p.full_name, p.role, p.created_at
FROM profiles p
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;

-- Review admin activity
SELECT al.user_id, p.email, al.action, al.resource_type, 
       count(*) as action_count,
       max(al.created_at) as last_action
FROM activity_logs al
JOIN profiles p ON p.id = al.user_id
WHERE p.role = 'admin'
AND al.created_at > now() - interval '30 days'
GROUP BY al.user_id, p.email, al.action, al.resource_type
ORDER BY action_count DESC;
```

#### 2. Failed Access Attempts
```sql
-- Monitor security audit log for suspicious activity
SELECT user_id, action_type, resource_type, 
       count(*) as failed_attempts,
       min(created_at) as first_attempt,
       max(created_at) as last_attempt
FROM security_audit_log 
WHERE success = false
AND created_at > now() - interval '24 hours'
GROUP BY user_id, action_type, resource_type
HAVING count(*) > 5
ORDER BY failed_attempts DESC;
```

## Disaster Recovery

### Recovery Procedures

#### 1. Point-in-Time Recovery
```sql
-- Supabase provides PITR through the dashboard
-- Document recovery point objectives (RPO): 1 hour
-- Document recovery time objectives (RTO): 30 minutes
```

#### 2. Partial Data Recovery
```sql
-- Recover specific organization data from backup
-- Example procedure for organization restoration

CREATE OR REPLACE FUNCTION restore_organization_data(
  org_id uuid,
  backup_timestamp timestamptz
)
RETURNS boolean AS $$
BEGIN
  -- Disable RLS for restoration
  SET row_security = off;
  
  -- Restore organization and related data
  -- Implementation depends on backup format
  -- This is a template for the procedure
  
  -- Re-enable RLS
  SET row_security = on;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Health Check Procedures

#### 1. System Health Validation
```sql
-- Comprehensive health check function
CREATE OR REPLACE FUNCTION system_health_check()
RETURNS TABLE(
  check_name text,
  status text,
  details text
) AS $$
BEGIN
  -- Check partition health
  RETURN QUERY
  SELECT 'Partition Count'::text as check_name,
         CASE WHEN count(*) >= 3 THEN 'OK' ELSE 'WARNING' END as status,
         'Found ' || count(*) || ' active partitions' as details
  FROM pg_tables 
  WHERE tablename ~ '^activity_logs_[0-9]{4}_[0-9]{2}$';
  
  -- Check materialized view freshness
  RETURN QUERY  
  SELECT 'Materialized View Freshness'::text as check_name,
         CASE WHEN pg_matviews.ispopulated THEN 'OK' ELSE 'ERROR' END as status,
         'Last refreshed: ' || coalesce(pg_stat_user_tables.last_analyze::text, 'Unknown') as details
  FROM pg_matviews 
  LEFT JOIN pg_stat_user_tables ON pg_stat_user_tables.relname = pg_matviews.matviewname
  WHERE pg_matviews.matviewname = 'mv_organization_metrics';
  
  -- Check job queue health
  RETURN QUERY
  SELECT 'Job Queue Health'::text as check_name,
         CASE WHEN coalesce(failed_jobs.count, 0) < 10 THEN 'OK' ELSE 'WARNING' END as status,
         'Failed jobs: ' || coalesce(failed_jobs.count, 0) as details
  FROM (
    SELECT count(*) as count FROM jobs WHERE status = 'failed'
  ) failed_jobs;
  
  -- Add more health checks as needed
END;
$$ LANGUAGE plpgsql;

-- Run health check
SELECT * FROM system_health_check();
```

## Monitoring and Alerting

### Key Metrics to Monitor

#### 1. Database Performance
- Query response times (target: <100ms for 95th percentile)
- Connection count (alert if >80% of limit)
- Cache hit ratio (target: >95%)
- Index usage efficiency

#### 2. Application Metrics  
- Job queue processing time
- Failed job rate (alert if >5%)
- Partition creation success
- RLS policy violations

#### 3. Business Metrics
- Organization growth rate
- Report upload volume
- Analysis completion rate
- User activity patterns

### Automated Maintenance Schedule

#### Daily (Automated)
- [ ] Health check execution
- [ ] Performance metrics collection  
- [ ] Failed job cleanup
- [ ] Security audit log review

#### Weekly (Semi-Automated)
- [ ] Materialized view refresh
- [ ] Index usage analysis
- [ ] Partition verification
- [ ] Backup validation

#### Monthly (Manual)
- [ ] Partition cleanup
- [ ] Statistics update
- [ ] Security access review
- [ ] Performance optimization review

This maintenance guide ensures the ESGCheck database operates efficiently and securely in production with proper monitoring, backup, and optimization procedures.