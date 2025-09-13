-- Insert development user into profiles table for testing (only if user exists)
DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  has_user boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) INTO has_user;

  IF has_user THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      dashboard_access,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
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
  ELSE
    RAISE NOTICE 'Skipping dev user profile seed: user % does not exist', v_user_id;
  END IF;
END $$;
