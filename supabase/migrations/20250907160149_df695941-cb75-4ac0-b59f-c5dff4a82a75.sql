-- Create development organization and user setup with proper UUIDs
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
  gen_random_uuid(),
  'Development Organization',
  'dev-org',
  'Technology',
  '1-10',
  'US',
  false,
  'free'
);

-- Step 2: Get the organization ID and create development user profile  
DO $$
DECLARE
    dev_org_id UUID;
    dev_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Get the organization ID we just created
    SELECT id INTO dev_org_id FROM organizations WHERE slug = 'dev-org';
    
    -- Create development user profile
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
      dev_user_id,
      'dev@example.com',
      'Development User', 
      'admin',
      true,
      dev_org_id,
      now(),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      default_organization_id = EXCLUDED.default_organization_id,
      updated_at = now();

    -- Create organization membership for development user
    INSERT INTO organization_members (
      organization_id,
      user_id,
      role,
      accepted_at,
      created_at,
      updated_at
    ) VALUES (
      dev_org_id,
      dev_user_id,
      'owner',
      now(),
      now(),
      now()
    ) ON CONFLICT (organization_id, user_id) DO UPDATE SET
      role = EXCLUDED.role,
      accepted_at = EXCLUDED.accepted_at,
      updated_at = now();
END $$;