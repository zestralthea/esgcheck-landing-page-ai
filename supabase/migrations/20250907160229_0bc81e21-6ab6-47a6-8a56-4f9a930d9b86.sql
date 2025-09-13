-- Create development organization for testing (only if it doesn't exist)
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
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Development Organization',
  'dev-org',
  'Technology',
  '1-10',
  'US',
  false,
  'free'
) ON CONFLICT (id) DO NOTHING;
