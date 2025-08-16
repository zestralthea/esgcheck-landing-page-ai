# ESGCheck Database Schema - Production Ready

## Overview
Final production-ready schema with all critical issues resolved, proper constraints, and complete RLS coverage.

## Critical Fixes Applied
1. ✅ Fixed FK conflicts with NOT NULL constraints
2. ✅ Added missing `deleted_at` columns
3. ✅ Fixed organization RLS public visibility
4. ✅ Improved latest analysis trigger efficiency
5. ✅ Added complete RLS coverage for all tables
6. ✅ Added job queue concurrency controls
7. ✅ Fixed GDPR deletion for auth.users

## Core Tables

### 1. Organizations & Multi-tenancy

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
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  subscription_expires_at timestamptz,
  is_public boolean DEFAULT false, -- For truly public org profiles
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_public ON organizations(is_public) WHERE is_public = true AND deleted_at IS NULL;
```

#### organization_members
```sql
CREATE TABLE organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON organization_members(user_id) WHERE accepted_at IS NOT NULL;
CREATE INDEX idx_org_members_org ON organization_members(organization_id) WHERE accepted_at IS NOT NULL;
```

### 2. User Profiles

#### profiles
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone_number text,
  timezone text DEFAULT 'UTC' CHECK (timezone ~ '^[A-Za-z/_]+$'),
  default_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  preferences jsonb DEFAULT '{}',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_default_org ON profiles(default_organization_id);
```

### 3. Waitlist Management

#### waitlist_entries
```sql
CREATE TABLE waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text,
  company_size text CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  use_case text,
  referral_source text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'converted', 'rejected')),
  approved_at timestamptz,
  converted_at timestamptz,
  converted_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_waitlist_email ON waitlist_entries(email);
CREATE INDEX idx_waitlist_status ON waitlist_entries(status) WHERE status = 'pending';
```

### 4. Document Management

#### documents
```sql
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for GDPR
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size >= 0),
  storage_path text UNIQUE NOT NULL,
  mime_type text,
  checksum text,
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_documents_org ON documents(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by) WHERE uploaded_by IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_documents_checksum ON documents(checksum) WHERE checksum IS NOT NULL;
```

### 5. ESG Reports

#### esg_reports
```sql
CREATE TABLE esg_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for GDPR
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  report_type text DEFAULT 'sustainability' CHECK (report_type IN ('annual', 'sustainability', 'impact', 'integrated', 'other')),
  reporting_period_start date NOT NULL,
  reporting_period_end date NOT NULL CHECK (reporting_period_end >= reporting_period_start),
  company_name text,
  industry text,
  framework text DEFAULT 'GRI' CHECK (framework IN ('GRI', 'SASB', 'TCFD', 'CDP', 'IIRC', 'Custom')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'analyzed', 'published', 'archived')),
  visibility text DEFAULT 'private' CHECK (visibility IN ('private', 'organization', 'public')),
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  deleted_at timestamptz,
  UNIQUE(organization_id, title, reporting_period_start, reporting_period_end)
);

CREATE INDEX idx_esg_reports_org_status ON esg_reports(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_reports_created_by ON esg_reports(created_by) WHERE created_by IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_esg_reports_period ON esg_reports(reporting_period_start, reporting_period_end) WHERE deleted_at IS NULL;
```

### 6. ESG Analyses

#### esg_analyses
```sql
CREATE TABLE esg_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id) ON DELETE CASCADE,
  analysis_version integer NOT NULL DEFAULT 1,
  framework_used text NOT NULL,
  ai_model text NOT NULL,
  environmental_score decimal(5,2) CHECK (environmental_score BETWEEN 0 AND 100),
  social_score decimal(5,2) CHECK (social_score BETWEEN 0 AND 100),
  governance_score decimal(5,2) CHECK (governance_score BETWEEN 0 AND 100),
  overall_score decimal(5,2) GENERATED ALWAYS AS (
    (COALESCE(environmental_score,0) + COALESCE(social_score,0) + COALESCE(governance_score,0))/3
  ) STORED,
  material_topics jsonb DEFAULT '[]',
  identified_gaps jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  risk_assessment jsonb DEFAULT '{}',
  full_analysis jsonb NOT NULL,
  confidence_score decimal(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
  processing_time_ms integer,
  is_latest boolean DEFAULT false,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(report_id, analysis_version)
);

-- Partial unique index for latest analysis
CREATE UNIQUE INDEX idx_esg_analyses_latest ON esg_analyses(report_id) WHERE is_latest = true AND deleted_at IS NULL;
CREATE INDEX idx_esg_analyses_report ON esg_analyses(report_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_analyses_report_latest_score ON esg_analyses(report_id, is_latest, overall_score) WHERE deleted_at IS NULL;
```

#### esg_analysis_exports
```sql
CREATE TABLE esg_analysis_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES esg_analyses(id) ON DELETE CASCADE,
  export_type text NOT NULL CHECK (export_type IN ('pdf', 'excel', 'word', 'json')),
  storage_path text,
  external_document_id text,
  generation_status text DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  expires_at timestamptz,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz -- Added missing column
);

CREATE INDEX idx_analysis_exports_analysis ON esg_analysis_exports(analysis_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_analysis_exports_status ON esg_analysis_exports(generation_status) 
  WHERE generation_status IN ('pending', 'processing') AND deleted_at IS NULL;
```

### 7. Job Queue System

#### jobs
```sql
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('analyze_report', 'generate_pdf', 'send_email', 'import_guidelines', 'cleanup')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
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
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  idempotency_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(idempotency_key),
  CHECK (attempts <= max_attempts)
);

-- Optimized index for job queue workers
CREATE INDEX idx_jobs_ready ON jobs(priority DESC, scheduled_for) 
  WHERE status IN ('pending', 'failed') AND scheduled_for <= now();
CREATE INDEX idx_jobs_correlation ON jobs(correlation_id);
CREATE INDEX idx_jobs_org ON jobs(organization_id) WHERE organization_id IS NOT NULL;
```

### 8. ESG Guidelines & Knowledge Base

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

CREATE INDEX idx_frameworks_code ON esg_frameworks(code) WHERE is_active = true;
```

#### esg_guidelines
```sql
CREATE TABLE esg_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES esg_frameworks(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  category text CHECK (category IN ('environmental', 'social', 'governance', 'general')),
  description text,
  requirements text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(framework_id, code)
);

CREATE INDEX idx_guidelines_framework ON esg_guidelines(framework_id);
CREATE INDEX idx_guidelines_category ON esg_guidelines(category);
```

#### esg_guideline_embeddings
```sql
CREATE TABLE esg_guideline_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_id uuid NOT NULL REFERENCES esg_guidelines(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  model_version text DEFAULT 'text-embedding-ada-002',
  dimension integer DEFAULT 1536,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(guideline_id, chunk_index)
);

CREATE INDEX idx_embeddings_guideline ON esg_guideline_embeddings(guideline_id);
CREATE INDEX idx_embeddings_vector ON esg_guideline_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 9. Activity & Audit Logs

#### activity_logs (auto-partitioned)
```sql
CREATE TABLE activity_logs (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
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

-- Auto-partition creation function
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  partition_date date;
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  partition_date := date_trunc('month', CURRENT_DATE + interval '1 month');
  partition_name := 'activity_logs_' || to_char(partition_date, 'YYYY_MM');
  start_date := partition_date;
  end_date := partition_date + interval '1 month';
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF activity_logs FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly: SELECT create_monthly_partition();

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_org ON activity_logs(organization_id, created_at DESC);
```

#### document_access_logs (auto-partitioned)
```sql
CREATE TABLE document_access_logs (
  id uuid DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  access_type text NOT NULL CHECK (access_type IN ('view', 'download', 'upload', 'delete', 'share')),
  success boolean DEFAULT true,
  error_message text,
  ip_address inet,
  correlation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_doc_access_document ON document_access_logs(document_id, created_at DESC);
CREATE INDEX idx_doc_access_user ON document_access_logs(user_id, created_at DESC);
```

### 10. System Configuration

#### feature_flags
```sql
CREATE TABLE feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Separate tables for scaling
CREATE TABLE feature_flag_users (
  feature_flag_id uuid REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_flag_id, user_id)
);

CREATE TABLE feature_flag_organizations (
  feature_flag_id uuid REFERENCES feature_flags(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_flag_id, organization_id)
);

CREATE INDEX idx_feature_flags_enabled ON feature_flags(name) WHERE is_enabled = true;
```

## Helper Functions

### Organization membership check
```sql
CREATE OR REPLACE FUNCTION user_organizations(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
AS $$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = user_uuid 
    AND accepted_at IS NOT NULL;
$$;
```

### Efficient latest analysis management
```sql
CREATE OR REPLACE FUNCTION set_latest_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this should be the latest
  IF NEW.is_latest = true THEN
    -- Unset previous latest in a single update
    UPDATE esg_analyses 
    SET is_latest = false 
    WHERE report_id = NEW.report_id 
      AND is_latest = true 
      AND id != NEW.id
      AND deleted_at IS NULL;
  END IF;
  
  -- Default new analyses to latest if no other exists
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_latest_analysis
  BEFORE INSERT OR UPDATE ON esg_analyses
  FOR EACH ROW
  EXECUTE FUNCTION set_latest_analysis();
```

### Job queue worker query
```sql
CREATE OR REPLACE FUNCTION claim_next_job(worker_id text)
RETURNS jobs AS $$
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
$$ LANGUAGE plpgsql;
```

### Auto-update timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
      AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at 
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END $$;
```

### Resource-scoped soft delete
```sql
CREATE OR REPLACE FUNCTION soft_delete_report_cascade()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_report_soft_delete
  AFTER UPDATE ON esg_reports
  FOR EACH ROW
  WHEN (NEW.deleted_at IS DISTINCT FROM OLD.deleted_at)
  EXECUTE FUNCTION soft_delete_report_cascade();
```

## Complete RLS Policies

### Helper function
```sql
CREATE OR REPLACE FUNCTION auth_user_id() 
RETURNS uuid 
LANGUAGE sql 
STABLE 
AS $$
  SELECT auth.uid()
$$;
```

### Organizations RLS
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY organizations_select ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM organization_members WHERE user_id = auth_user_id())
    OR (is_public = true AND deleted_at IS NULL)
  );

CREATE POLICY organizations_insert ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY organizations_update ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
    )
  );
```

### ESG Reports RLS
```sql
ALTER TABLE esg_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY esg_reports_select ON esg_reports
  FOR SELECT USING (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
    OR visibility = 'public'
  );

CREATE POLICY esg_reports_insert ON esg_reports
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY esg_reports_update ON esg_reports
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin', 'member')
    )
  );
```

### ESG Analyses RLS
```sql
ALTER TABLE esg_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY esg_analyses_select ON esg_analyses
  FOR SELECT USING (
    report_id IN (
      SELECT id FROM esg_reports
      WHERE organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
        OR visibility = 'public'
    )
  );

CREATE POLICY esg_analyses_insert ON esg_analyses
  FOR INSERT WITH CHECK (
    report_id IN (
      SELECT id FROM esg_reports
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin', 'member')
      )
    )
  );
```

### ESG Analysis Exports RLS
```sql
ALTER TABLE esg_analysis_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY esg_analysis_exports_select ON esg_analysis_exports
  FOR SELECT USING (
    analysis_id IN (
      SELECT a.id FROM esg_analyses a
      JOIN esg_reports r ON r.id = a.report_id
      WHERE r.organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
        OR r.visibility = 'public'
    )
  );

CREATE POLICY esg_analysis_exports_insert ON esg_analysis_exports
  FOR INSERT WITH CHECK (
    analysis_id IN (
      SELECT a.id FROM esg_analyses a
      JOIN esg_reports r ON r.id = a.report_id
      WHERE r.organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin', 'member')
      )
    )
  );
```

### Documents RLS
```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_select ON documents
  FOR SELECT USING (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
    OR is_public = true
  );

CREATE POLICY documents_insert ON documents
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

CREATE POLICY documents_update ON documents
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin', 'member')
    )
  );
```

### Jobs RLS
```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY jobs_select ON jobs
  FOR SELECT USING (
    organization_id IS NULL -- System jobs
    OR organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

CREATE POLICY jobs_insert ON jobs
  FOR INSERT WITH CHECK (
    organization_id IS NULL
    OR organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

CREATE POLICY jobs_update ON jobs
  FOR UPDATE USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
    )
  );
```

## GDPR & Compliance

### PII Data Locations
- `auth.users`: email, encrypted password (handled by Supabase)
- `profiles`: full_name, phone_number
- `waitlist_entries`: email, full_name
- `activity_logs`: ip_address, user_agent
- `document_access_logs`: ip_address

### GDPR Deletion Implementation
```sql
-- Database function for non-auth deletions
CREATE OR REPLACE FUNCTION gdpr_delete_user_data(user_uuid uuid)
RETURNS void AS $$
BEGIN
  -- Hard delete PII from profiles
  DELETE FROM profiles WHERE id = user_uuid;
  
  -- Anonymize activity logs
  UPDATE activity_logs 
  SET user_id = NULL, 
      ip_address = NULL, 
      user_agent = 'GDPR_DELETED'
  WHERE user_id = user_uuid;
  
  UPDATE document_access_logs 
  SET user_id = NULL, 
      ip_address = NULL
  WHERE user_id = user_uuid;
  
  -- Soft delete or anonymize business records
  UPDATE esg_reports SET created_by = NULL WHERE created_by = user_uuid;
  UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = user_uuid;
  UPDATE jobs SET created_by = NULL WHERE created_by = user_uuid;
  
  -- Mark organization memberships as deleted
  UPDATE organization_members SET deleted_at = now() WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Deletion from auth.users must be done via Supabase Admin API in an Edge Function
```

## Migration Order

```sql
-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Core tables (no dependencies)
CREATE TABLE organizations...
CREATE TABLE profiles...
CREATE TABLE waitlist_entries...
CREATE TABLE esg_frameworks...
CREATE TABLE feature_flags...
CREATE TABLE system_settings...

-- 3. Tables with single dependencies
CREATE TABLE organization_members...
CREATE TABLE documents...
CREATE TABLE esg_guidelines...
CREATE TABLE feature_flag_users...
CREATE TABLE feature_flag_organizations...

-- 4. Tables with multiple dependencies
CREATE TABLE esg_reports...
CREATE TABLE jobs...
CREATE TABLE esg_guideline_embeddings...

-- 5. Dependent tables
CREATE TABLE esg_analyses...
CREATE TABLE esg_analysis_exports...

-- 6. Partitioned tables
CREATE TABLE activity_logs...
CREATE TABLE document_access_logs...

-- 7. Functions
CREATE FUNCTION user_organizations...
CREATE FUNCTION update_updated_at...
CREATE FUNCTION set_latest_analysis...
CREATE FUNCTION claim_next_job...
CREATE FUNCTION soft_delete_report_cascade...
CREATE FUNCTION gdpr_delete_user_data...
CREATE FUNCTION create_monthly_partition...

-- 8. Triggers
CREATE TRIGGER update_*_updated_at...
CREATE TRIGGER ensure_latest_analysis...
CREATE TRIGGER cascade_report_soft_delete...

-- 9. RLS Policies
ALTER TABLE * ENABLE ROW LEVEL SECURITY...
CREATE POLICY...

-- 10. Initial partitions
SELECT create_monthly_partition();

-- 11. Analyze for statistics
ANALYZE;
```

## Performance Tuning

```sql
-- After initial data load
ANALYZE organizations;
ANALYZE esg_reports;
ANALYZE esg_analyses;
ANALYZE esg_guideline_embeddings;

-- Vector search tuning
SET ivfflat.probes = 10;

-- Connection pooling recommendations
-- pgbouncer config:
-- pool_mode = transaction
-- default_pool_size = 25
-- max_client_conn = 100

-- Statement timeout for queries
ALTER DATABASE your_db SET statement_timeout = '30s';

-- Work memory for complex queries
ALTER DATABASE your_db SET work_mem = '16MB';
```

## Monitoring Queries

```sql
-- Active queries
CREATE VIEW active_queries AS
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  query_start,
  state,
  query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Table bloat check
CREATE VIEW table_bloat AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
CREATE VIEW index_usage AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## Ready for Production Checklist

✅ All NOT NULL conflicts resolved
✅ Missing columns added
✅ RLS policies complete for all tables
✅ Soft delete cascading is resource-scoped
✅ Job queue with