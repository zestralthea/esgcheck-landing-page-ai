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