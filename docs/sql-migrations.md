# SQL Migration Files - Updated

Current database schema migrations for ESGCheck with 30+ tables, partitioning, views, and comprehensive RLS policies.

## Extensions & Foundation

### 001: Enable Extensions
**File**: `20250101000000_enable_extensions.sql`

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector search for AI embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable crypto functions for secure operations
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

## Core Multi-Tenancy Tables

### 002: Organizations
**File**: `20250101000001_create_organizations.sql`

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

-- Performance indexes
CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_public ON organizations(is_public) WHERE is_public = true AND deleted_at IS NULL;

-- RLS Policy
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_select" ON organizations FOR SELECT
USING ((id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND deleted_at IS NULL)) 
       OR (is_public = true AND deleted_at IS NULL));
```

### 003: Organization Members
**File**: `20250101000002_create_organization_members.sql`

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
  deleted_at timestamptz,
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON organization_members(user_id) WHERE accepted_at IS NOT NULL;
CREATE INDEX idx_org_members_org ON organization_members(organization_id) WHERE accepted_at IS NOT NULL;

-- RLS Policies
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select" ON organization_members FOR SELECT
USING (organization_id IN (SELECT user_organizations(auth.uid())));
```

### 004: User Profiles
**File**: `20250101000003_create_profiles.sql`

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  role text DEFAULT 'user',
  avatar_url text,
  phone_number text,
  timezone text DEFAULT 'UTC',
  default_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  preferences jsonb DEFAULT '{}',
  onboarding_completed boolean DEFAULT false,
  dashboard_access boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-profile creation trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    dashboard_access,
    created_at, 
    updated_at
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user',
    true,
    now(), 
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT
USING ((id = auth.uid()) OR 
       (id IN (SELECT om.user_id FROM organization_members om 
               WHERE om.organization_id IN (SELECT user_organizations(auth.uid()))
               AND om.deleted_at IS NULL)));
```

## Document Management

### 005: Documents
**File**: `20250101000005_create_documents.sql`

```sql
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  original_filename text,
  file_type text NOT NULL,
  mime_type text,
  file_size bigint NOT NULL CHECK (file_size >= 0),
  storage_path text UNIQUE NOT NULL,
  checksum text,
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_documents_org ON documents(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_user ON documents(user_id) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select" ON documents FOR SELECT
USING ((organization_id IN (SELECT user_organizations(auth.uid()))) 
       OR (is_public = true) 
       OR (user_id = auth.uid()));
```

### 006: Document Access Logs (Partitioned)
**File**: `20250101000006_create_document_access_logs.sql`

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
  accessed_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE document_access_logs_2025_08 PARTITION OF document_access_logs 
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE document_access_logs_2025_09 PARTITION OF document_access_logs 
FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE document_access_logs_2025_10 PARTITION OF document_access_logs 
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Auto-partition function
CREATE OR REPLACE FUNCTION create_document_logs_monthly_partition()
RETURNS void AS $$
DECLARE
  partition_date date;
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  partition_date := date_trunc('month', CURRENT_DATE + interval '1 month');
  partition_name := 'document_access_logs_' || to_char(partition_date, 'YYYY_MM');
  start_date := partition_date;
  end_date := partition_date + interval '1 month';
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF document_access_logs FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## ESG Reporting System

### 007: ESG Reports
**File**: `20250101000007_create_esg_reports.sql`

```sql
CREATE TABLE esg_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
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

CREATE INDEX idx_esg_reports_org_status ON esg_reports(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_reports_user ON esg_reports(user_id) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE esg_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "esg_reports_select" ON esg_reports FOR SELECT
USING ((organization_id IN (SELECT user_organizations(auth.uid()))) 
       OR (visibility = 'public') 
       OR (user_id = auth.uid()));
```

### 008: ESG Analyses
**File**: `20250101000008_create_esg_analyses.sql`

```sql
CREATE TABLE esg_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id) ON DELETE CASCADE,
  analysis_version integer NOT NULL DEFAULT 1,
  framework_used text NOT NULL,
  ai_model text NOT NULL,
  environmental_score numeric(5,2) CHECK (environmental_score BETWEEN 0 AND 100),
  social_score numeric(5,2) CHECK (social_score BETWEEN 0 AND 100),
  governance_score numeric(5,2) CHECK (governance_score BETWEEN 0 AND 100),
  overall_score numeric(5,2) CHECK (overall_score BETWEEN 0 AND 100),
  material_topics jsonb DEFAULT '[]',
  identified_gaps jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  risk_assessment jsonb DEFAULT '{}',
  full_analysis jsonb NOT NULL,
  confidence_score numeric(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
  processing_time_ms integer,
  is_latest boolean DEFAULT false,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Latest analysis management
CREATE UNIQUE INDEX idx_esg_analyses_latest ON esg_analyses(report_id) 
WHERE is_latest = true AND deleted_at IS NULL;

CREATE OR REPLACE FUNCTION set_latest_analysis()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_latest_analysis
  BEFORE INSERT OR UPDATE ON esg_analyses
  FOR EACH ROW EXECUTE FUNCTION set_latest_analysis();
```

### 009: ESG Report Analyses
**File**: `20250101000009_create_esg_report_analyses.sql`

```sql
CREATE TABLE esg_report_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id) ON DELETE CASCADE,
  framework text NOT NULL DEFAULT 'GRI',
  analysis_data jsonb NOT NULL DEFAULT '{}',
  pdf_document_id text,
  pdf_download_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_esg_report_analyses_report ON esg_report_analyses(report_id);

-- RLS Policy
ALTER TABLE esg_report_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analyses for their organization reports" ON esg_report_analyses FOR SELECT
USING (report_id IN (
  SELECT esg_reports.id FROM esg_reports 
  WHERE esg_reports.organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )
));
```

### 010: ESG Insights & Scores
**File**: `20250101000010_create_esg_insights_scores.sql`

```sql
-- ESG Insights
CREATE TABLE esg_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id) ON DELETE CASCADE,
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

-- ESG Scores
CREATE TABLE esg_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id) ON DELETE CASCADE,
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

-- RLS Policies for both tables
ALTER TABLE esg_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage insights for their organization reports" ON esg_insights FOR ALL
USING (report_id IN (
  SELECT esg_reports.id FROM esg_reports 
  WHERE esg_reports.organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )
));

CREATE POLICY "Users can manage scores for their organization reports" ON esg_scores FOR ALL
USING (report_id IN (
  SELECT esg_reports.id FROM esg_reports 
  WHERE esg_reports.organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )
));
```

## Knowledge Base & AI

### 011: ESG Frameworks
**File**: `20250101000011_create_esg_frameworks.sql`

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

-- Initial framework data
INSERT INTO esg_frameworks (code, name, version, description, official_url) VALUES
  ('GRI', 'Global Reporting Initiative', '2021', 'Global standards for sustainability reporting', 'https://www.globalreporting.org/'),
  ('SASB', 'Sustainability Accounting Standards Board', '2023', 'Industry-specific ESG standards', 'https://www.sasb.org/'),
  ('TCFD', 'Task Force on Climate-related Financial Disclosures', '2022', 'Climate risk disclosure framework', 'https://www.fsb-tcfd.org/'),
  ('CDP', 'Carbon Disclosure Project', '2023', 'Environmental disclosure system', 'https://www.cdp.net/'),
  ('IIRC', 'International Integrated Reporting Council', '2021', 'Integrated reporting framework', 'https://www.integratedreporting.org/');
```

### 012: ESG Guidelines & Embeddings
**File**: `20250101000012_create_guidelines_embeddings.sql`

```sql
-- ESG Guidelines
CREATE TABLE esg_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES esg_frameworks(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  category text,
  description text,
  requirements text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(framework_id, code)
);

-- Vector Embeddings for AI search
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

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_guidelines(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  framework_code text DEFAULT NULL
)
RETURNS TABLE (
  guideline_id uuid,
  framework_code text,
  guideline_code text,
  title text,
  content text,
  chunk_index int,
  similarity float
)
LANGUAGE plpgsql
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
    (framework_code IS NULL OR f.code = framework_code)
    AND 1 - (ge.embedding <=> query_embedding) > match_threshold
  ORDER BY ge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Additional guideline chunks table (legacy/compatibility)
CREATE TABLE guideline_chunks (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  framework text NOT NULL,
  document_name text NOT NULL,
  content text NOT NULL,
  embedding vector NOT NULL
);

CREATE OR REPLACE FUNCTION match_guideline_chunks(
  query_embedding vector,
  match_threshold double precision,
  match_count integer,
  framework_name text
)
RETURNS TABLE(id bigint, content text, embedding vector, similarity double precision)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gc.id,
    gc.content,
    gc.embedding,
    1 - (gc.embedding <=> query_embedding) AS similarity
  FROM guideline_chunks gc
  WHERE
    (framework_name IS NULL OR gc.framework = framework_name)
    AND (1 - (gc.embedding <=> query_embedding)) > match_threshold
  ORDER BY gc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Job Processing System

### 013: Jobs Queue
**File**: `20250101000013_create_jobs_queue.sql`

```sql
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid DEFAULT gen_random_uuid(),
  kind text NOT NULL,
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

-- Optimized job queue index
CREATE INDEX idx_jobs_ready ON jobs(priority DESC, scheduled_for) 
WHERE status IN ('pending', 'failed') AND scheduled_for <= now();

-- Job claiming function for workers
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

-- Background jobs (email processing)
CREATE TABLE background_jobs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  job_type text NOT NULL,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending',
  attempts integer DEFAULT 0,
  error_message text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_select" ON jobs FOR SELECT
USING ((organization_id IS NULL) OR (organization_id IN (SELECT user_organizations(auth.uid()))));

CREATE POLICY "Admins can view background jobs" ON background_jobs FOR SELECT
USING (is_admin());
```

## Audit & Monitoring

### 014: Activity Logs (Partitioned)
**File**: `20250101000014_create_activity_logs.sql`

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

-- Create monthly partitions
CREATE TABLE activity_logs_2025_08 PARTITION OF activity_logs 
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE activity_logs_2025_09 PARTITION OF activity_logs 
FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE activity_logs_2025_10 PARTITION OF activity_logs 
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Auto-partition creation
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

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF activity_logs FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS Policy
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_logs_select" ON activity_logs FOR SELECT
USING ((user_id = auth.uid()) OR 
       (organization_id IN (
         SELECT organization_id FROM organization_members 
         WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND deleted_at IS NULL
       )));
```

### 015: Security Audit Log
**File**: `20250101000015_create_security_audit_log.sql`

```sql
CREATE TABLE security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_audit_log_user ON security_audit_log(user_id, created_at DESC);
CREATE INDEX idx_security_audit_log_action ON security_audit_log(action_type, created_at DESC);

-- Security logging function
CREATE OR REPLACE FUNCTION log_security_event(
  action_type_param text,
  resource_type_param text,
  resource_id_param text DEFAULT NULL,
  success_param boolean DEFAULT true,
  error_msg text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        action_type,
        resource_type,
        resource_id,
        success,
        error_message
    ) VALUES (
        auth.uid(),
        action_type_param,
        resource_type_param,
        resource_id_param,
        success_param,
        error_msg
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- RLS Policy
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all security audit logs" ON security_audit_log FOR SELECT
USING (is_admin());

CREATE POLICY "System can insert security audit logs" ON security_audit_log FOR INSERT
WITH CHECK (true);
```

## Feature Management & Configuration

### 016: Feature Flags
**File**: `20250101000016_create_feature_flags.sql`

```sql
-- Feature flags table
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

-- User-specific feature access
CREATE TABLE feature_flag_users (
  feature_flag_id uuid REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_flag_id, user_id)
);

-- Organization-specific feature access
CREATE TABLE feature_flag_organizations (
  feature_flag_id uuid REFERENCES feature_flags(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_flag_id, organization_id)
);

-- Feature access checking function
CREATE OR REPLACE FUNCTION has_feature_access(
  feature_name text,
  user_uuid uuid DEFAULT NULL,
  org_uuid uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
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
    RETURN (hashtext(user_uuid::text) % 100) < flag_record.rollout_percentage;
  END IF;

  RETURN false;
END;
$$;

-- RLS Policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feature flags" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins can update feature flags" ON feature_flags FOR UPDATE USING (is_admin());

CREATE POLICY "feature_flag_users_select" ON feature_flag_users FOR SELECT USING (true);
CREATE POLICY "feature_flag_organizations_select" ON feature_flag_organizations FOR SELECT USING (true);
```

### 017: System Settings & Waitlist
**File**: `20250101000017_create_system_settings.sql`

```sql
-- System configuration
CREATE TABLE system_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Initial system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('max_file_size_mb', '100', 'Maximum file upload size in MB'),
  ('allowed_file_types', 'pdf,docx,xlsx', 'Comma-separated allowed file types'),
  ('email_notifications', 'true', 'Enable/disable email notifications'),
  ('analytics_enabled', 'true', 'Enable/disable analytics tracking');

-- Waitlist management
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
  converted_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Waitlist rate limiting function
CREATE OR REPLACE FUNCTION check_waitlist_rate_limit(user_email text, user_ip inet DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check for recent signups from same email (last 5 minutes)
  SELECT COUNT(*) INTO recent_count
  FROM public.waitlist_entries
  WHERE email = user_email 
    AND created_at > (NOW() - INTERVAL '5 minutes');
  
  IF recent_count > 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Waitlist confirmation trigger
CREATE OR REPLACE FUNCTION send_waitlist_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert a job into the background jobs table for email sending
    INSERT INTO public.background_jobs (
        job_type, 
        payload, 
        status
    ) VALUES (
        'send_waitlist_email',
        jsonb_build_object(
            'name', NEW.full_name,
            'email', NEW.email,
            'inserted_at', NOW()
        ),
        'pending'
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_waitlist_entry_created
  AFTER INSERT ON waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION send_waitlist_confirmation();
```

## Monitoring Views & Analytics

### 018: Monitoring Views
**File**: `20250101000018_create_monitoring_views.sql`

```sql
-- Active database queries
CREATE VIEW active_queries AS 
SELECT pid, usename, application_name, client_addr, state, 
       query_start, now() - query_start AS duration, 
       left(query, 100) AS query_preview
FROM pg_stat_activity 
WHERE state != 'idle' AND query != '<IDLE>';

-- Table sizes
CREATE VIEW table_sizes AS
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
       pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage statistics
CREATE VIEW index_usage AS
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch,
       pg_size_pretty(pg_relation_size(indexname)) AS index_size
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Job queue health
CREATE VIEW job_queue_health AS
SELECT kind, status, COUNT(*) AS count,
       MIN(created_at) AS oldest_job_created_at,
       MAX(created_at) AS newest_job_created_at,
       AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) AS avg_duration_seconds,
       MAX(EXTRACT(EPOCH FROM (completed_at - started_at))) AS max_duration_seconds
FROM jobs 
GROUP BY kind, status
ORDER BY kind, status;

-- Organization analytics
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
LEFT JOIN organization_members om ON o.id = om.organization_id AND om.accepted_at IS NOT NULL AND om.deleted_at IS NULL
LEFT JOIN esg_reports r ON o.id = r.organization_id AND r.deleted_at IS NULL
LEFT JOIN esg_analyses a ON r.id = a.report_id AND a.deleted_at IS NULL
LEFT JOIN documents d ON o.id = d.organization_id AND d.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.subscription_tier;

-- User activity summary
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

### 019: Materialized Views
**File**: `20250101000019_create_materialized_views.sql`

```sql
-- Pre-computed organization metrics for dashboards
CREATE MATERIALIZED VIEW mv_organization_metrics AS
SELECT o.id, o.name, o.subscription_tier,
       COUNT(DISTINCT om.user_id) AS active_members,
       COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'published') AS published_reports,
       AVG(a.overall_score) AS avg_esg_score,
       COUNT(DISTINCT a.id) AS total_analyses,
       SUM(d.file_size) AS storage_used_bytes
FROM organizations o
LEFT JOIN organization_members om ON o.id = om.organization_id AND om.accepted_at IS NOT NULL AND om.deleted_at IS NULL
LEFT JOIN esg_reports r ON o.id = r.organization_id AND r.deleted_at IS NULL
LEFT JOIN esg_analyses a ON r.id = a.report_id AND a.is_latest = true AND a.deleted_at IS NULL
LEFT JOIN documents d ON o.id = d.organization_id AND d.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.subscription_tier;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX idx_mv_org_metrics_id ON mv_organization_metrics(id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_organization_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_organization_metrics;
END;
$$;
```

## Utility Functions & Triggers

### 020: Helper Functions
**File**: `20250101000020_create_helper_functions.sql`

```sql
-- Core utility functions
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid()
$$;

CREATE OR REPLACE FUNCTION user_organizations(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
AS $$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = user_uuid 
    AND accepted_at IS NOT NULL
    AND deleted_at IS NULL
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Timestamp updating trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_esg_reports_updated_at
  BEFORE UPDATE ON esg_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Soft delete cascade for reports
CREATE OR REPLACE FUNCTION soft_delete_report_cascade()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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
$$;

CREATE TRIGGER cascade_report_soft_delete
  BEFORE UPDATE ON esg_reports
  FOR EACH ROW EXECUTE FUNCTION soft_delete_report_cascade();

-- GDPR compliance function
CREATE OR REPLACE FUNCTION gdpr_delete_user_data(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Hard delete PII in profiles
  DELETE FROM profiles WHERE id = user_uuid;

  -- Anonymize activity logs
  UPDATE activity_logs 
  SET user_id = NULL, 
      ip_address = NULL, 
      user_agent = 'GDPR_DELETED'
  WHERE user_id = user_uuid;

  -- Anonymize document access logs
  UPDATE document_access_logs 
  SET user_id = NULL, 
      ip_address = NULL
  WHERE user_id = user_uuid;

  -- Anonymize business records
  UPDATE esg_reports SET created_by = NULL WHERE created_by = user_uuid;
  UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = user_uuid;
  UPDATE jobs SET created_by = NULL WHERE created_by = user_uuid;

  -- Mark organization memberships as deleted
  UPDATE organization_members 
  SET deleted_at = now()
  WHERE user_id = user_uuid AND deleted_at IS NULL;
END;
$$;
```

## Summary

This comprehensive migration set creates:

- **30+ Tables**: Complete schema for multi-tenant ESG platform
- **Partitioned Tables**: Auto-scaling audit logs by month
- **6 Views**: Real-time monitoring and analytics
- **1 Materialized View**: Pre-computed metrics
- **Vector Search**: AI-powered guideline matching
- **Job Queue**: Async task processing
- **RLS Security**: Multi-tenant data isolation
- **Audit Logging**: Comprehensive activity tracking
- **Feature Flags**: Dynamic feature management
- **Performance Optimization**: Indexes and constraints

The schema supports production workloads with proper security, scalability, and monitoring infrastructure.