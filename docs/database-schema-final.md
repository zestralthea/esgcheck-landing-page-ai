# ESGCheck Database Schema - Production Ready

## Overview
Production-ready schema with comprehensive multi-tenancy, job processing, monitoring infrastructure, and 30+ tables supporting the complete ESGCheck platform.

## Database Architecture

### Multi-Tenancy Model
- **Organizations**: Primary tenant isolation
- **Organization Members**: Role-based access control
- **Row-Level Security**: Enforces data isolation
- **Public/Private Visibility**: Configurable data sharing

### Core Infrastructure
- **Job Queue System**: Async processing with priority and retry logic
- **Partitioned Logging**: Auto-partitioned audit trails by month
- **Vector Search**: AI-powered guideline matching
- **Monitoring Views**: Real-time system health metrics
- **Materialized Views**: Pre-computed analytics

## Current Tables (30+ Tables)

### 1. Core Multi-Tenancy Tables

#### organizations
```sql
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  website text,
  industry text,
  size text CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  country text,
  settings jsonb DEFAULT '{}',
  subscription_tier text DEFAULT 'free',
  subscription_expires_at timestamptz,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

#### organization_members
```sql
CREATE TABLE organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL DEFAULT 'member',
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

#### profiles
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  email text,
  role text DEFAULT 'user',
  avatar_url text,
  phone_number text,
  timezone text DEFAULT 'UTC',
  default_organization_id uuid REFERENCES organizations(id),
  preferences jsonb DEFAULT '{}',
  onboarding_completed boolean DEFAULT false,
  dashboard_access boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Document Management

#### documents
```sql
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  user_id uuid REFERENCES auth.users(id),
  uploaded_by uuid REFERENCES auth.users(id),
  file_name text NOT NULL,
  original_filename text,
  file_type text NOT NULL,
  mime_type text,
  file_size bigint NOT NULL,
  storage_path text UNIQUE NOT NULL,
  checksum text,
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

#### document_access_logs (Partitioned)
```sql
CREATE TABLE document_access_logs (
  id uuid DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id),
  user_id uuid REFERENCES auth.users(id),
  access_type text NOT NULL,
  success boolean DEFAULT true,
  error_message text,
  ip_address inet,
  correlation_id uuid,
  accessed_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);
```

### 3. ESG Reporting System

#### esg_reports
```sql
CREATE TABLE esg_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  user_id uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  document_id uuid REFERENCES documents(id),
  title text NOT NULL,
  report_title text,
  description text,
  company_name text,
  report_type text DEFAULT 'sustainability',
  reporting_period_start date NOT NULL,
  reporting_period_end date NOT NULL,
  industry text,
  framework text DEFAULT 'GRI',
  status text DEFAULT 'draft',
  visibility text DEFAULT 'private',
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  deleted_at timestamptz
);
```

#### esg_analyses
```sql
CREATE TABLE esg_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id),
  analysis_version integer NOT NULL DEFAULT 1,
  framework_used text NOT NULL,
  ai_model text NOT NULL,
  environmental_score numeric(5,2),
  social_score numeric(5,2),
  governance_score numeric(5,2),
  overall_score numeric(5,2),
  material_topics jsonb DEFAULT '[]',
  identified_gaps jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  risk_assessment jsonb DEFAULT '{}',
  full_analysis jsonb NOT NULL,
  confidence_score numeric(5,2),
  processing_time_ms integer,
  is_latest boolean DEFAULT false,
  job_id uuid REFERENCES jobs(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

#### esg_report_analyses
```sql
CREATE TABLE esg_report_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id),
  framework text NOT NULL DEFAULT 'GRI',
  analysis_data jsonb NOT NULL DEFAULT '{}',
  pdf_document_id text,
  pdf_download_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### esg_analysis_exports
```sql
CREATE TABLE esg_analysis_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES esg_analyses(id),
  export_type text NOT NULL,
  storage_path text,
  external_document_id text,
  generation_status text DEFAULT 'pending',
  error_message text,
  expires_at timestamptz,
  job_id uuid REFERENCES jobs(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

#### esg_insights
```sql
CREATE TABLE esg_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id),
  insight_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  actionable boolean DEFAULT true,
  impact_score numeric(5,2),
  implementation_effort text,
  gri_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### esg_scores
```sql
CREATE TABLE esg_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id),
  category text NOT NULL,
  subcategory text,
  score numeric NOT NULL,
  max_score numeric NOT NULL DEFAULT 100,
  weight numeric DEFAULT 1.0,
  confidence_level numeric(5,2),
  gri_disclosure text,
  methodology text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 4. Knowledge Base & AI

#### esg_frameworks
```sql
CREATE TABLE esg_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  version text,
  description text,
  official_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### esg_guidelines
```sql
CREATE TABLE esg_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES esg_frameworks(id),
  code text NOT NULL,
  title text NOT NULL,
  category text,
  description text,
  requirements text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### esg_guideline_embeddings
```sql
CREATE TABLE esg_guideline_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_id uuid NOT NULL REFERENCES esg_guidelines(id),
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  model_version text DEFAULT 'text-embedding-ada-002',
  dimension integer DEFAULT 1536,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

#### guideline_chunks
```sql
CREATE TABLE guideline_chunks (
  id bigint PRIMARY KEY DEFAULT nextval('guideline_chunks_id_seq'),
  framework text NOT NULL,
  document_name text NOT NULL,
  content text NOT NULL,
  embedding vector NOT NULL
);
```

### 5. Job Processing System

#### jobs
```sql
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  status text DEFAULT 'pending',
  priority integer DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}',
  result jsonb,
  error_message text,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  last_attempt_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  scheduled_for timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  organization_id uuid REFERENCES organizations(id),
  idempotency_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### background_jobs
```sql
CREATE TABLE background_jobs (
  id bigint PRIMARY KEY,
  job_type text NOT NULL,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending',
  attempts integer DEFAULT 0,
  error_message text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### 6. Audit & Monitoring

#### activity_logs (Partitioned)
```sql
CREATE TABLE activity_logs (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  organization_id uuid REFERENCES organizations(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  correlation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);
```

#### security_audit_log
```sql
CREATE TABLE security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 7. Feature Management

#### feature_flags
```sql
CREATE TABLE feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### feature_flag_users
```sql
CREATE TABLE feature_flag_users (
  feature_flag_id uuid REFERENCES feature_flags(id),
  user_id uuid REFERENCES auth.users(id),
  PRIMARY KEY (feature_flag_id, user_id)
);
```

#### feature_flag_organizations
```sql
CREATE TABLE feature_flag_organizations (
  feature_flag_id uuid REFERENCES feature_flags(id),
  organization_id uuid REFERENCES organizations(id),
  PRIMARY KEY (feature_flag_id, organization_id)
);
```

### 8. System Configuration

#### system_settings
```sql
CREATE TABLE system_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### waitlist_entries
```sql
CREATE TABLE waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text,
  company_size text,
  use_case text,
  referral_source text,
  status text DEFAULT 'pending',
  approved_at timestamptz,
  converted_at timestamptz,
  converted_user_id uuid REFERENCES auth.users(id),
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Monitoring Views

### 1. active_queries
Real-time database query monitoring
```sql
CREATE VIEW active_queries AS 
SELECT pid, usename, application_name, client_addr, state, 
       query_start, now() - query_start AS duration, 
       left(query, 100) AS query_preview
FROM pg_stat_activity 
WHERE state != 'idle' AND query != '<IDLE>';
```

### 2. table_sizes
Database table size monitoring
```sql
CREATE VIEW table_sizes AS
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
       pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. index_usage
Index utilization statistics
```sql
CREATE VIEW index_usage AS
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch,
       pg_size_pretty(pg_relation_size(indexname)) AS index_size
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

### 4. job_queue_health
Job processing metrics
```sql
CREATE VIEW job_queue_health AS
SELECT kind, status, COUNT(*) AS count,
       MIN(created_at) AS oldest_job_created_at,
       MAX(created_at) AS newest_job_created_at,
       AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) AS avg_duration_seconds,
       MAX(EXTRACT(EPOCH FROM (completed_at - started_at))) AS max_duration_seconds
FROM jobs 
GROUP BY kind, status
ORDER BY kind, status;
```

### 5. organization_stats
Organization usage analytics
```sql
CREATE VIEW organization_stats AS
SELECT o.id AS organization_id, o.name AS organization_name, o.subscription_tier,
       COUNT(DISTINCT om.user_id) AS member_count,
       COUNT(DISTINCT r.id) AS report_count,
       COUNT(DISTINCT a.id) AS analysis_count,
       COUNT(DISTINCT d.id) AS document_count,
       SUM(d.file_size) AS total_storage_bytes,
       MAX(r.created_at) AS last_report_created_at,
       MAX(a.created_at) AS last_analysis_created_at
FROM organizations o
LEFT JOIN organization_members om ON o.id = om.organization_id AND om.accepted_at IS NOT NULL
LEFT JOIN esg_reports r ON o.id = r.organization_id AND r.deleted_at IS NULL
LEFT JOIN esg_analyses a ON r.id = a.report_id AND a.deleted_at IS NULL
LEFT JOIN documents d ON o.id = d.organization_id AND d.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.subscription_tier;
```

### 6. user_activity_summary
User activity metrics
```sql
CREATE VIEW user_activity_summary AS
SELECT p.id, p.full_name, p.email,
       COUNT(DISTINCT al.id) AS activity_count,
       MAX(al.created_at) AS last_activity,
       COUNT(DISTINCT r.id) AS reports_created,
       COUNT(DISTINCT d.id) AS documents_uploaded
FROM profiles p
LEFT JOIN activity_logs al ON p.id = al.user_id AND al.created_at > now() - interval '30 days'
LEFT JOIN esg_reports r ON p.id = r.created_by AND r.deleted_at IS NULL
LEFT JOIN documents d ON p.id = d.uploaded_by AND d.deleted_at IS NULL
GROUP BY p.id, p.full_name, p.email
ORDER BY last_activity DESC NULLS LAST;
```

## Materialized Views

### mv_organization_metrics
Pre-computed organization performance metrics
```sql
CREATE MATERIALIZED VIEW mv_organization_metrics AS
SELECT o.id, o.name, o.subscription_tier,
       COUNT(DISTINCT om.user_id) AS active_members,
       COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'published') AS published_reports,
       AVG(a.overall_score) AS avg_esg_score,
       COUNT(DISTINCT a.id) AS total_analyses,
       SUM(d.file_size) AS storage_used_bytes
FROM organizations o
LEFT JOIN organization_members om ON o.id = om.organization_id 
LEFT JOIN esg_reports r ON o.id = r.organization_id AND r.deleted_at IS NULL
LEFT JOIN esg_analyses a ON r.id = a.report_id AND a.is_latest = true AND a.deleted_at IS NULL
LEFT JOIN documents d ON o.id = d.organization_id AND d.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.subscription_tier;

CREATE UNIQUE INDEX idx_mv_org_metrics_id ON mv_organization_metrics(id);
```

## Partitioned Tables

Current partitioned tables with auto-partitioning:

### Activity Logs Partitions
- `activity_logs_2025_08` (August 2025)
- `activity_logs_2025_09` (September 2025) 
- `activity_logs_2025_10` (October 2025)

### Document Access Logs Partitions
- `document_access_logs_2025_08`
- `document_access_logs_2025_09`
- `document_access_logs_2025_10`

## Row Level Security (RLS) Policies

All core tables have comprehensive RLS policies enforcing:

1. **Multi-tenant isolation**: Users can only access data from their organizations
2. **Role-based permissions**: Different access levels (owner, admin, member, viewer)
3. **Public data access**: Configurable public visibility for reports and organizations
4. **Admin overrides**: System administrators can access all data

## Helper Functions

### Core Functions
- `auth_user_id()`: Get current user ID
- `user_organizations(uuid)`: Get user's organization memberships
- `is_admin()`: Check admin status
- `claim_next_job(text)`: Job queue worker function
- `set_latest_analysis()`: Manage latest analysis flags
- `handle_new_user()`: Auto-create profiles on signup
- `update_updated_at()`: Auto-update timestamps
- `soft_delete_report_cascade()`: Cascade soft deletes

### Utility Functions
- `check_waitlist_rate_limit()`: Rate limiting for signups
- `log_security_event()`: Security audit logging
- `log_document_access()`: Document access logging
- `manually_verify_user()`: Admin user verification
- `get_document_access_summary()`: Document analytics
- `refresh_organization_metrics()`: Refresh materialized views

## Performance Optimizations

### Indexes
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- Vector indexes for similarity search
- GIN indexes for JSONB and array columns

### Partitioning
- Monthly partitions for audit logs
- Auto-partition creation functions
- Partition pruning for efficient queries

### Materialized Views
- Pre-computed metrics for dashboards
- Scheduled refresh procedures
- Concurrent refresh support

## Security Features

### Access Control
- Row Level Security on all tables
- JWT-based authentication
- Role-based authorization
- Multi-tenant data isolation

### Audit Logging
- Comprehensive activity tracking
- Security event logging
- Document access monitoring
- Partition-based retention

### Data Protection
- GDPR compliance functions
- Soft delete patterns
- Data anonymization
- Secure file storage

## Migration Status

✅ **Complete Schema**: All 30+ tables created and configured
✅ **RLS Policies**: Comprehensive security implemented
✅ **Indexes & Performance**: Optimized for production workloads
✅ **Monitoring**: Full observability infrastructure
✅ **Job Processing**: Async task management
✅ **Partitioning**: Auto-scaling audit logs
✅ **Vector Search**: AI-powered content matching
✅ **Multi-tenancy**: Complete isolation and access control

This schema supports the full ESGCheck platform with production-ready scalability, security, and monitoring capabilities.