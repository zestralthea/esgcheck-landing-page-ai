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