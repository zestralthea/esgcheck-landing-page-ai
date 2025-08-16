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