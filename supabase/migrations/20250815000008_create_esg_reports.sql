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