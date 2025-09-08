-- Insert development user into profiles table for testing
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  dashboard_access,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'dev@example.com',
  'Development User',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  dashboard_access = true,
  updated_at = now();