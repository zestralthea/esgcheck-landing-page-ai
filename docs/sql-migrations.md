# SQL Migration Files

Copy these migrations to your `supabase/migrations/` folder with the appropriate timestamps.

## 001: Enable Extensions
**File**: `20250101000000_enable_extensions.sql`

```sql
-- Migration: Enable Required Extensions
-- Description: Enable UUID generation and vector search capabilities

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector search for embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable crypto functions for secure tokens
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

## 002: Organizations
**File**: `20250101000001_create_organizations.sql`

```sql
-- Migration: Create Organizations Table
-- Description: Multi-tenant organization structure

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
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_public ON organizations(is_public) WHERE is_public = true AND deleted_at IS NULL;
CREATE INDEX idx_organizations_created ON organizations(created_at DESC) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE organizations IS 'Multi-tenant organizations';
COMMENT ON COLUMN organizations.slug IS 'URL-safe unique identifier';
COMMENT ON COLUMN organizations.is_public IS 'Whether organization profile is publicly visible';
```

## 003: Organization Members
**File**: `20250101000002_create_organization_members.sql`

```sql
-- Migration: Create Organization Members Table
-- Description: User membership and roles within organizations

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

-- Indexes
CREATE INDEX idx_org_members_user ON organization_members(user_id) WHERE accepted_at IS NOT NULL;
CREATE INDEX idx_org_members_org ON organization_members(organization_id) WHERE accepted_at IS NOT NULL;
CREATE INDEX idx_org_members_role ON organization_members(organization_id, role) WHERE accepted_at IS NOT NULL;

-- Comments
COMMENT ON TABLE organization_members IS 'User membership and roles within organizations';
COMMENT ON COLUMN organization_members.role IS 'User role: owner, admin, member, viewer';
COMMENT ON COLUMN organization_members.accepted_at IS 'NULL for pending invitations';
```

## 004: User Profiles
**File**: `20250101000003_create_profiles.sql`

```sql
-- Migration: Create User Profiles Table
-- Description: Extended user information beyond auth.users

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

-- Indexes
CREATE INDEX idx_profiles_default_org ON profiles(default_organization_id);
CREATE INDEX idx_profiles_created ON profiles(created_at DESC);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (new.id, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Comments
COMMENT ON TABLE profiles IS 'Extended user profile information';
COMMENT ON COLUMN profiles.timezone IS 'IANA timezone identifier';
```

## 005: Waitlist Entries
**File**: `20250101000004_create_waitlist_entries.sql`

```sql
-- Migration: Create Waitlist Entries Table
-- Description: Track waitlist signups and conversions

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

-- Indexes
CREATE INDEX idx_waitlist_email ON waitlist_entries(email);
CREATE INDEX idx_waitlist_status ON waitlist_entries(status) WHERE status = 'pending';
CREATE INDEX idx_waitlist_created ON waitlist_entries(created_at DESC);

-- Comments
COMMENT ON TABLE waitlist_entries IS 'Waitlist signups and conversion tracking';
COMMENT ON COLUMN waitlist_entries.status IS 'Waitlist entry status: pending, approved, converted, rejected';
```

## 006: Documents
**File**: `20250101000005_create_documents.sql`

```sql
-- Migration: Create Documents Table
-- Description: Central document storage and management

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Indexes
CREATE INDEX idx_documents_org ON documents(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by) WHERE uploaded_by IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_documents_checksum ON documents(checksum) WHERE checksum IS NOT NULL;
CREATE INDEX idx_documents_created ON documents(created_at DESC) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE documents IS 'Central document storage tracking';
COMMENT ON COLUMN documents.storage_path IS 'Path in storage bucket';
COMMENT ON COLUMN documents.checksum IS 'SHA256 hash for deduplication';
```

## 007: Jobs Queue
**File**: `20250101000006_create_jobs_queue.sql`

```sql
-- Migration: Create Jobs Queue Table
-- Description: Async job processing and orchestration

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

-- Indexes
CREATE INDEX idx_jobs_ready ON jobs(priority DESC, scheduled_for) 
  WHERE status IN ('pending', 'failed') AND scheduled_for <= now();
CREATE INDEX idx_jobs_correlation ON jobs(correlation_id);
CREATE INDEX idx_jobs_org ON jobs(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_jobs_kind_status ON jobs(kind, status);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- Job claim function for workers
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

-- Comments
COMMENT ON TABLE jobs IS 'Async job queue for background processing';
COMMENT ON COLUMN jobs.correlation_id IS 'For distributed tracing';
COMMENT ON COLUMN jobs.idempotency_key IS 'Prevents duplicate job creation';
```

## 008: ESG Reports
**File**: `20250101000007_create_esg_reports.sql`

```sql
-- Migration: Create ESG Reports Table
-- Description: Main ESG report records with multi-tenant support

CREATE TABLE esg_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Indexes
CREATE INDEX idx_esg_reports_org_status ON esg_reports(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_reports_created_by ON esg_reports(created_by) WHERE created_by IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_esg_reports_period ON esg_reports(reporting_period_start, reporting_period_end) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_reports_status ON esg_reports(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_reports_visibility ON esg_reports(visibility) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_reports_framework ON esg_reports(framework) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE esg_reports IS 'ESG report records with organizational context';
COMMENT ON COLUMN esg_reports.visibility IS 'Access control: private, organization, public';
COMMENT ON COLUMN esg_reports.framework IS 'Reporting framework used';
```

## 009: ESG Analyses
**File**: `20250101000008_create_esg_analyses.sql`

```sql
-- Migration: Create ESG Analyses Table
-- Description: AI analysis results for ESG reports

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

-- Indexes
CREATE UNIQUE INDEX idx_esg_analyses_latest ON esg_analyses(report_id) WHERE is_latest = true AND deleted_at IS NULL;
CREATE INDEX idx_esg_analyses_report ON esg_analyses(report_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_analyses_report_latest_score ON esg_analyses(report_id, is_latest, overall_score) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_analyses_created ON esg_analyses(created_at DESC) WHERE deleted_at IS NULL;

-- Latest analysis management trigger
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
  FOR EACH ROW
  EXECUTE FUNCTION set_latest_analysis();

-- Comments
COMMENT ON TABLE esg_analyses IS 'AI-generated analysis results for ESG reports';
COMMENT ON COLUMN esg_analyses.is_latest IS 'Marks the most recent analysis per report';
```

## 010: ESG Analysis Exports
**File**: `20250101000009_create_analysis_exports.sql`

```sql
-- Migration: Create ESG Analysis Exports Table
-- Description: Track generated export files (PDF, Excel, etc.)

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
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_analysis_exports_analysis ON esg_analysis_exports(analysis_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_analysis_exports_status ON esg_analysis_exports(generation_status) 
  WHERE generation_status IN ('pending', 'processing') AND deleted_at IS NULL;
CREATE INDEX idx_analysis_exports_created ON esg_analysis_exports(created_at DESC) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE esg_analysis_exports IS 'Generated export files for analyses';
COMMENT ON COLUMN esg_analysis_exports.external_document_id IS 'External service ID (e.g., PDFMonkey)';
```

## 011: ESG Frameworks
**File**: `20250101000010_create_esg_frameworks.sql`

```sql
-- Migration: Create ESG Frameworks Table
-- Description: ESG reporting frameworks and standards

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

-- Indexes
CREATE INDEX idx_frameworks_code ON esg_frameworks(code) WHERE is_active = true;
CREATE INDEX idx_frameworks_active ON esg_frameworks(is_active);

-- Initial data
INSERT INTO esg_frameworks (code, name, version, description, official_url) VALUES
  ('GRI', 'Global Reporting Initiative', '2021', 'The global standards for sustainability reporting', 'https://www.globalreporting.org/'),
  ('SASB', 'Sustainability Accounting Standards Board', '2023', 'Industry-specific standards for material ESG factors', 'https://www.sasb.org/'),
  ('TCFD', 'Task Force on Climate-related Financial Disclosures', '2022', 'Framework for climate-related financial risk disclosures', 'https://www.fsb-tcfd.org/'),
  ('CDP', 'Carbon Disclosure Project', '2023', 'Global environmental disclosure system', 'https://www.cdp.net/'),
  ('IIRC', 'International Integrated Reporting Council', '2021', 'Framework for integrated reporting', 'https://www.integratedreporting.org/');

-- Comments
COMMENT ON TABLE esg_frameworks IS 'ESG reporting frameworks and standards';
```

## 012: ESG Guidelines
**File**: `20250101000011_create_esg_guidelines.sql`

```sql
-- Migration: Create ESG Guidelines Table
-- Description: Specific guidelines within each framework

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

-- Indexes
CREATE INDEX idx_guidelines_framework ON esg_guidelines(framework_id);
CREATE INDEX idx_guidelines_category ON esg_guidelines(category);
CREATE INDEX idx_guidelines_code ON esg_guidelines(code);

-- Comments
COMMENT ON TABLE esg_guidelines IS 'Specific guidelines and requirements within frameworks';
```

## 013: ESG Guideline Embeddings
**File**: `20250101000012_create_guideline_embeddings.sql`

```sql
-- Migration: Create ESG Guideline Embeddings Table
-- Description: Vector embeddings for semantic search

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

-- Indexes
CREATE INDEX idx_embeddings_guideline ON esg_guideline_embeddings(guideline_id);
CREATE INDEX idx_embeddings_vector ON esg_guideline_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Vector search function
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
  chunk_index integer,
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

-- Comments
COMMENT ON TABLE esg_guideline_embeddings IS 'Vector embeddings for semantic search';
COMMENT ON FUNCTION search_guidelines IS 'Semantic search across guideline content';
```

## 014: Activity Logs
**File**: `20250101000013_create_activity_logs.sql`

```sql
-- Migration: Create Activity Logs Table (Partitioned)
-- Description: User activity tracking with automatic partitioning

-- Main partitioned table
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

-- Create initial partitions
CREATE TABLE activity_logs_2025_01 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE activity_logs_2025_02 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE activity_logs_2025_03 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Indexes on parent table (inherited by partitions)
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_org ON activity_logs(organization_id, created_at DESC);
CREATE INDEX idx_activity_logs_correlation ON activity_logs(correlation_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action, created_at DESC);

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

-- Comments
COMMENT ON TABLE activity_logs IS 'Partitioned user activity audit trail';
```

## 015: Document Access Logs
**File**: `20250101000014_create_document_access_logs.sql`

```sql
-- Migration: Create Document Access Logs Table (Partitioned)
-- Description: Document access audit trail

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

-- Create initial partitions
CREATE TABLE document_access_logs_2025_01 PARTITION OF document_access_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE document_access_logs_2025_02 PARTITION OF document_access_logs
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE document_access_logs_2025_03 PARTITION OF document_access_logs
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Indexes
CREATE INDEX idx_doc_access_document ON document_access_logs(document_id, created_at DESC);
CREATE INDEX idx_doc_access_user ON document_access_logs(user_id, created_at DESC);
CREATE INDEX idx_doc_access_type ON document_access_logs(access_type, created_at DESC);

-- Comments
COMMENT ON TABLE document_access_logs IS 'Document access audit trail';
```

## 016: Feature Flags
**File**: `20250101000015_create_feature_flags.sql`

```sql
-- Migration: Create Feature Flags Tables
-- Description: Dynamic feature toggles with user/org targeting

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

-- User-specific feature flags
CREATE TABLE feature_flag_users (
  feature_flag_id uuid REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_flag_id, user_id)
);

-- Organization-specific feature flags
CREATE TABLE feature_flag_organizations (
  feature_flag_id uuid REFERENCES feature_flags(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_flag_id, organization_id)
);

-- Indexes
CREATE INDEX idx_feature_flags_enabled ON feature_flags(name) WHERE is_enabled = true;
CREATE INDEX idx_feature_flag_users_user ON feature_flag_users(user_id);
CREATE INDEX idx_feature_flag_orgs_org ON feature_flag_organizations(organization_id);

-- Helper function to check feature access
CREATE OR REPLACE FUNCTION has_feature_access(
  feature_name text,
  user_uuid uuid DEFAULT NULL,
  org_uuid uuid DEFAULT NULL
)
RETURNS boolean AS $$
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
    -- Simple hash-based rollout
    RETURN (hashtext(user_uuid::text) % 100) < flag_record.rollout_percentage;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE feature_flags IS 'Feature flag configuration';
COMMENT ON FUNCTION has_feature_access IS 'Check if user/org has access to a feature';
```

## 017: System Settings
**File**: `20250101000016_create_system_settings.sql`

```sql
-- Migration: Create System Settings Table
-- Description: Application configuration storage

CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_system_