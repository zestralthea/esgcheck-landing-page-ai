# ESGCheck Database Migration Playbook

## Overview
This playbook provides a step-by-step guide for migrating from the current messy database structure to the new clean, multi-tenant architecture.

## Migration Philosophy
- **Incremental & Reversible**: Each migration can be rolled back
- **Data Preservation**: No data loss during migration
- **Zero Downtime**: Use blue-green deployment for production
- **Testing First**: Test each migration in isolated environment

## Pre-Migration Checklist

### 1. Backup Current State
```bash
# Full database backup
pg_dump -h localhost -U postgres -d your_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables
pg_dump -h localhost -U postgres -d your_db \
  -t waitlist -t esg_reports -t documents \
  > data_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Environment Setup
```bash
# Create migration testing database
createdb esgcheck_migration_test

# Set environment variables
export SUPABASE_DB_URL="postgresql://..."
export MIGRATION_MODE="test" # or "production"
```

### 3. Dependencies Check
- [ ] Supabase CLI installed and configured
- [ ] PostgreSQL client tools available
- [ ] All environment variables documented
- [ ] Edge functions deployment access verified

## Migration Phases

### Phase 0: Preparation (Day 1)
**Goal**: Set up foundation without breaking existing functionality

1. **Create backup schema**
   ```sql
   CREATE SCHEMA IF NOT EXISTS legacy_backup;
   ```

2. **Clone existing tables to backup**
   ```sql
   -- This preserves current state for rollback
   CREATE TABLE legacy_backup.waitlist AS SELECT * FROM public.waitlist;
   CREATE TABLE legacy_backup.esg_reports AS SELECT * FROM public.esg_reports;
   -- Repeat for all tables
   ```

3. **Enable required extensions**
   - uuid-ossp
   - vector
   - pg_stat_statements

### Phase 1: Organizations & Auth (Day 2-3)
**Goal**: Add multi-tenancy without breaking single-tenant usage

1. Run migration: `001_organizations.sql`
2. Run migration: `002_organization_members.sql`
3. Run migration: `003_profiles_update.sql`

**Data Migration**:
```sql
-- Create default organization for existing users
INSERT INTO organizations (name, slug, subscription_tier)
SELECT 
  COALESCE(company, email) as name,
  regexp_replace(lower(COALESCE(company, email)), '[^a-z0-9-]', '-', 'g') as slug,
  'free' as subscription_tier
FROM (
  SELECT DISTINCT ON (user_id) 
    user_id, 
    company, 
    email
  FROM esg_reports r
  JOIN auth.users u ON u.id = r.user_id
) existing_users;

-- Link users to their organizations
INSERT INTO organization_members (organization_id, user_id, role, accepted_at)
SELECT 
  o.id,
  r.user_id,
  'owner',
  now()
FROM (
  SELECT DISTINCT user_id FROM esg_reports
) r
JOIN organizations o ON o.slug = regexp_replace(lower(COALESCE(company, email)), '[^a-z0-9-]', '-', 'g');
```

**Validation**:
```sql
-- Check all users have organizations
SELECT COUNT(*) FROM auth.users u
LEFT JOIN organization_members om ON om.user_id = u.id
WHERE om.id IS NULL;
-- Should return 0
```

### Phase 2: Core Tables Migration (Day 4-5)
**Goal**: Migrate to new schema structure

1. Run migration: `004_documents_restructure.sql`
2. Run migration: `005_esg_reports_restructure.sql`
3. Run migration: `006_esg_analyses_restructure.sql`

**Data Migration**:
```sql
-- Migrate documents (if they exist separately)
INSERT INTO documents (
  id, organization_id, uploaded_by, file_name, 
  file_type, file_size, storage_path, created_at
)
SELECT 
  d.id,
  om.organization_id,
  d.user_id,
  d.filename,
  d.file_type,
  d.file_size,
  d.storage_path,
  d.created_at
FROM old_documents d
JOIN organization_members om ON om.user_id = d.user_id;

-- Migrate ESG reports with organization linkage
INSERT INTO esg_reports (
  id, organization_id, created_by, title, 
  report_type, reporting_period_start, reporting_period_end,
  status, created_at
)
SELECT 
  r.id,
  om.organization_id,
  r.user_id,
  r.report_title,
  COALESCE(r.report_type, 'sustainability'),
  r.reporting_period_start,
  r.reporting_period_end,
  COALESCE(r.status, 'draft'),
  r.created_at
FROM old_esg_reports r
JOIN organization_members om ON om.user_id = r.user_id;
```

### Phase 3: Analysis & Jobs (Day 6)
**Goal**: Set up async processing infrastructure

1. Run migration: `007_jobs_queue.sql`
2. Run migration: `008_analysis_exports.sql`

**Data Migration**:
```sql
-- Migrate existing analyses
INSERT INTO esg_analyses (
  report_id, analysis_version, framework_used,
  ai_model, full_analysis, is_latest, created_at
)
SELECT 
  report_id,
  ROW_NUMBER() OVER (PARTITION BY report_id ORDER BY created_at) as analysis_version,
  COALESCE(framework, 'GRI'),
  'gpt-4',
  analysis_data,
  ROW_NUMBER() OVER (PARTITION BY report_id ORDER BY created_at DESC) = 1,
  created_at
FROM esg_report_analyses;
```

### Phase 4: Guidelines & Embeddings (Day 7)
**Goal**: Fix vector search functionality

1. Run migration: `009_esg_frameworks.sql`
2. Run migration: `010_esg_guidelines.sql`
3. Run migration: `011_guideline_embeddings.sql`

**Data Migration**:
```sql
-- Migrate frameworks
INSERT INTO esg_frameworks (code, name, version)
VALUES 
  ('GRI', 'Global Reporting Initiative', '2021'),
  ('SASB', 'Sustainability Accounting Standards Board', '2023'),
  ('TCFD', 'Task Force on Climate-related Financial Disclosures', '2022');

-- Migrate guideline chunks to new structure
INSERT INTO esg_guideline_embeddings (
  guideline_id, chunk_index, content, embedding
)
SELECT 
  g.id,
  ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY c.created_at),
  c.content,
  c.embedding
FROM old_guideline_chunks c
JOIN esg_guidelines g ON g.title = c.title;
```

### Phase 5: Logging & Monitoring (Day 8)
**Goal**: Set up observability

1. Run migration: `012_activity_logs.sql`
2. Run migration: `013_system_configuration.sql`
3. Run migration: `014_monitoring_views.sql`

### Phase 6: RLS & Security (Day 9)
**Goal**: Enable row-level security

1. Run migration: `015_rls_policies.sql`
2. Run migration: `016_helper_functions.sql`

**Validation**:
```sql
-- Test RLS policies
SET ROLE authenticated;
SET request.jwt.claim.sub = 'test-user-uuid';

-- Should only see own organization's data
SELECT COUNT(*) FROM esg_reports;
```

### Phase 7: Cleanup (Day 10)
**Goal**: Remove old tables and optimize

1. Run migration: `017_cleanup_old_tables.sql`
2. Run migration: `018_performance_indexes.sql`

```sql
-- After validation, drop legacy tables
DROP TABLE IF EXISTS old_waitlist CASCADE;
DROP TABLE IF EXISTS old_esg_reports CASCADE;
DROP TABLE IF EXISTS old_esg_report_analyses CASCADE;

-- Vacuum and analyze
VACUUM ANALYZE;
```

## Rollback Procedures

### Quick Rollback (< 5 minutes)
```sql
-- Restore from backup schema
BEGIN;
DROP TABLE IF EXISTS waitlist CASCADE;
CREATE TABLE waitlist AS SELECT * FROM legacy_backup.waitlist;
-- Repeat for all tables
COMMIT;
```

### Full Rollback (< 30 minutes)
```bash
# Restore from SQL dump
psql -h localhost -U postgres -d your_db < backup_20240115_120000.sql
```

## Edge Functions Migration

### Update Environment Variables
```bash
# Add new required variables
supabase secrets set ORGANIZATION_MODE=true
supabase secrets set JOB_QUEUE_ENABLED=true
```

### Deploy Updated Functions
```bash
# Deploy in order
supabase functions deploy auth-helpers
supabase functions deploy job-processor
supabase functions deploy analyze-esg-report-v2
supabase functions deploy secure-file-upload-v2
```

## Testing Checklist

### Unit Tests
- [ ] Organization creation and membership
- [ ] Report creation with organization context
- [ ] RLS policies for each table
- [ ] Job queue processing
- [ ] Vector search functionality

### Integration Tests
- [ ] Full ESG report upload → analysis → PDF generation flow
- [ ] User registration → organization creation → team invite flow
- [ ] Admin dashboard with multi-org support
- [ ] Public report viewing

### Performance Tests
- [ ] Query performance with 10k+ reports
- [ ] Vector search with 100k+ embeddings
- [ ] Concurrent job processing
- [ ] RLS performance impact

## Monitoring Post-Migration

### Key Metrics to Track
```sql
-- Query performance
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- Table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Job queue health
SELECT 
  status,
  COUNT(*),
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM jobs
WHERE created_at > now() - interval '1 hour'
GROUP BY status;
```

### Alerts to Set Up
1. Failed job rate > 5%
2. Query duration > 5 seconds
3. Connection pool exhaustion
4. Disk usage > 80%
5. Failed RLS policy checks

## Go/No-Go Criteria

### Green Light (Proceed)
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Rollback tested successfully
- [ ] Team trained on new structure
- [ ] Monitoring in place

### Red Light (Abort/Rollback)
- [ ] Data integrity issues detected
- [ ] Performance degradation > 20%
- [ ] Critical functionality broken
- [ ] RLS policies not working correctly

## Post-Migration Tasks

1. **Documentation Update**
   - Update API documentation
   - Update developer onboarding guide
   - Create troubleshooting guide

2. **Performance Tuning**
   ```sql
   -- Update statistics
   ANALYZE;
   
   -- Tune autovacuum
   ALTER TABLE esg_reports SET (autovacuum_vacuum_scale_factor = 0.1);
   ALTER TABLE esg_analyses SET (autovacuum_vacuum_scale_factor = 0.1);
   ```

3. **Backup Strategy**
   - Set up automated daily backups
   - Test restore procedures
   - Document recovery time objectives

## Emergency Contacts

- **Database Admin**: [Your contact]
- **Backend Lead**: [Your contact]
- **DevOps**: [Your contact]
- **Supabase Support**: support@supabase.io

## Success Metrics

### Week 1 Post-Migration
- Zero data loss incidents
- Query performance within 10% of baseline
- All features functional
- No critical bugs reported

### Month 1 Post-Migration
- 50% reduction in database-related bugs
- 30% improvement in query performance
- Successful onboarding of 5+ new organizations
- Zero security incidents

## Appendix: Common Issues & Solutions

### Issue: RLS policies blocking legitimate access
```sql
-- Debug RLS
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM esg_reports;
```

### Issue: Slow vector searches
```sql
-- Increase probes for better accuracy
SET ivfflat.probes = 20;

-- Rebuild index with more lists
DROP INDEX idx_embeddings_vector;
CREATE INDEX idx_embeddings_vector ON esg_guideline_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 200);
```

### Issue: Job queue backed up
```sql
-- Clear stuck jobs
UPDATE jobs 
SET status = 'failed', 
    error_message = 'Manually failed due to backup'
WHERE status = 'running' 
  AND started_at < now() - interval '1 hour';
```

## Sign-off

- [ ] Database Administrator: _________________ Date: _______
- [ ] Backend Team Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______