-- Create development organization and user setup
-- Step 1: Create a development organization
INSERT INTO organizations (
  id,
  name,
  slug,
  industry,
  size,
  country,
  is_public,
  subscription_tier
) VALUES (
  'dev-org-00000000-0000-0000-0000-000000000001'::uuid,
  'Development Organization',
  'dev-org',
  'Technology',
  '1-10',
  'US',
  false,
  'free'
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Create development user profile with proper UUID
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  dashboard_access,
  default_organization_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'dev@example.com',
  'Development User', 
  'admin',
  true,
  'dev-org-00000000-0000-0000-0000-000000000001'::uuid,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  default_organization_id = EXCLUDED.default_organization_id,
  updated_at = now();

-- Step 3: Create organization membership for development user
INSERT INTO organization_members (
  organization_id,
  user_id,
  role,
  accepted_at,
  created_at,
  updated_at
) VALUES (
  'dev-org-00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'owner',
  now(),
  now(),
  now()
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  accepted_at = EXCLUDED.accepted_at,
  updated_at = now();