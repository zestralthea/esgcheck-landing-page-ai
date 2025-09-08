-- Assign admin@esgcheck.ch to Development Organization
INSERT INTO public.organization_members (
  organization_id,
  user_id, 
  role,
  invited_by,
  invited_at,
  accepted_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- Development Organization
  'eabe774e-11d2-41d1-b311-1b37ef721489'::uuid, -- admin@esgcheck.ch
  'owner',
  'eabe774e-11d2-41d1-b311-1b37ef721489'::uuid, -- self-invited
  now(),
  now(), -- immediately accepted
  now(),
  now()
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  accepted_at = EXCLUDED.accepted_at,
  updated_at = now();

-- Set Development Organization as default for admin user
UPDATE public.profiles 
SET 
  default_organization_id = '00000000-0000-0000-0000-000000000001'::uuid,
  updated_at = now()
WHERE id = 'eabe774e-11d2-41d1-b311-1b37ef721489'::uuid;