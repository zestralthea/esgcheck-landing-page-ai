-- Migration: Create Row Level Security Policies
-- Description: Implement multi-tenant data isolation and access control

-- Enable RLS on relevant tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_analysis_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Organizations policies
DROP POLICY IF EXISTS organizations_select ON organizations;
CREATE POLICY organizations_select ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM organization_members WHERE user_id = auth_user_id() AND deleted_at IS NULL)
    OR (is_public = true AND deleted_at IS NULL)
  );

DROP POLICY IF EXISTS organizations_insert ON organizations;
CREATE POLICY organizations_insert ON organizations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS organizations_update ON organizations;
CREATE POLICY organizations_update ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
        AND deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS organizations_delete ON organizations;
CREATE POLICY organizations_delete ON organizations
  FOR DELETE USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role = 'owner'
        AND deleted_at IS NULL
    )
  );

-- Organization members policies
DROP POLICY IF EXISTS org_members_select ON organization_members;
CREATE POLICY org_members_select ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

DROP POLICY IF EXISTS org_members_insert ON organization_members;
CREATE POLICY org_members_insert ON organization_members
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
        AND deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS org_members_update ON organization_members;
CREATE POLICY org_members_update ON organization_members
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
        AND deleted_at IS NULL
    )
  );

-- Profiles policies
DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    id = auth_user_id()
    OR id IN (
      SELECT user_id FROM organization_members
      WHERE organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
        AND deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = auth_user_id());

-- Documents policies
DROP POLICY IF EXISTS documents_select ON documents;
CREATE POLICY documents_select ON documents
  FOR SELECT USING (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
    OR is_public = true
  );

DROP POLICY IF EXISTS documents_insert ON documents;
CREATE POLICY documents_insert ON documents
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

DROP POLICY IF EXISTS documents_update ON documents;
CREATE POLICY documents_update ON documents
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin', 'member')
        AND deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS documents_delete ON documents;
CREATE POLICY documents_delete ON documents
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
        AND deleted_at IS NULL
    )
  );

-- ESG Reports policies
DROP POLICY IF EXISTS esg_reports_select ON esg_reports;
CREATE POLICY esg_reports_select ON esg_reports
  FOR SELECT USING (
    organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
    OR visibility = 'public'
  );

DROP POLICY IF EXISTS esg_reports_insert ON esg_reports;
CREATE POLICY esg_reports_insert ON esg_reports
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin', 'member')
        AND deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS esg_reports_update ON esg_reports;
CREATE POLICY esg_reports_update ON esg_reports
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin', 'member')
        AND deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS esg_reports_delete ON esg_reports;
CREATE POLICY esg_reports_delete ON esg_reports
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
        AND deleted_at IS NULL
    )
  );

-- ESG Analyses policies
DROP POLICY IF EXISTS esg_analyses_select ON esg_analyses;
CREATE POLICY esg_analyses_select ON esg_analyses
  FOR SELECT USING (
    report_id IN (
      SELECT id FROM esg_reports
      WHERE organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
        OR visibility = 'public'
    )
  );

DROP POLICY IF EXISTS esg_analyses_insert ON esg_analyses;
CREATE POLICY esg_analyses_insert ON esg_analyses
  FOR INSERT WITH CHECK (
    report_id IN (
      SELECT id FROM esg_reports
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin', 'member')
          AND deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS esg_analyses_update ON esg_analyses;
CREATE POLICY esg_analyses_update ON esg_analyses
  FOR UPDATE USING (
    report_id IN (
      SELECT id FROM esg_reports
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin', 'member')
          AND deleted_at IS NULL
      )
    )
  );

-- ESG Analysis Exports policies
DROP POLICY IF EXISTS esg_analysis_exports_select ON esg_analysis_exports;
CREATE POLICY esg_analysis_exports_select ON esg_analysis_exports
  FOR SELECT USING (
    analysis_id IN (
      SELECT a.id FROM esg_analyses a
      JOIN esg_reports r ON r.id = a.report_id
      WHERE r.organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
        OR r.visibility = 'public'
    )
  );

DROP POLICY IF EXISTS esg_analysis_exports_insert ON esg_analysis_exports;
CREATE POLICY esg_analysis_exports_insert ON esg_analysis_exports
  FOR INSERT WITH CHECK (
    analysis_id IN (
      SELECT a.id FROM esg_analyses a
      JOIN esg_reports r ON r.id = a.report_id
      WHERE r.organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin', 'member')
          AND deleted_at IS NULL
      )
    )
  );

-- Jobs policies
DROP POLICY IF EXISTS jobs_select ON jobs;
CREATE POLICY jobs_select ON jobs
  FOR SELECT USING (
    organization_id IS NULL -- System jobs
    OR organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

DROP POLICY IF EXISTS jobs_insert ON jobs;
CREATE POLICY jobs_insert ON jobs
  FOR INSERT WITH CHECK (
    organization_id IS NULL
    OR organization_id IN (SELECT * FROM user_organizations(auth_user_id()))
  );

DROP POLICY IF EXISTS jobs_update ON jobs;
CREATE POLICY jobs_update ON jobs
  FOR UPDATE USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
        AND deleted_at IS NULL
    )
  );

-- Activity logs policies
DROP POLICY IF EXISTS activity_logs_select ON activity_logs;
CREATE POLICY activity_logs_select ON activity_logs
  FOR SELECT USING (
    user_id = auth_user_id()
    OR organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth_user_id() 
        AND role IN ('owner', 'admin')
        AND deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS activity_logs_insert ON activity_logs;
CREATE POLICY activity_logs_insert ON activity_logs
  FOR INSERT WITH CHECK (true); -- System can log any activity

-- Document access logs policies
DROP POLICY IF EXISTS document_access_logs_select ON document_access_logs;
CREATE POLICY document_access_logs_select ON document_access_logs
  FOR SELECT USING (
    user_id = auth_user_id()
    OR document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth_user_id() 
          AND role IN ('owner', 'admin')
          AND deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS document_access_logs_insert ON document_access_logs;
CREATE POLICY document_access_logs_insert ON document_access_logs
  FOR INSERT WITH CHECK (true); -- System can log any access

-- Feature flags policies
DROP POLICY IF EXISTS feature_flags_select ON feature_flags;
CREATE POLICY feature_flags_select ON feature_flags
  FOR SELECT USING (true); -- readable for all

DROP POLICY IF EXISTS feature_flag_users_select ON feature_flag_users;
CREATE POLICY feature_flag_users_select ON feature_flag_users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS feature_flag_organizations_select ON feature_flag_organizations;
CREATE POLICY feature_flag_organizations_select ON feature_flag_organizations
  FOR SELECT USING (true);

-- System settings policies
DROP POLICY IF EXISTS system_settings_select ON system_settings;
CREATE POLICY system_settings_select ON system_settings
  FOR SELECT USING (is_public = true);