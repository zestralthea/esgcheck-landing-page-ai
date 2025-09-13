-- CRITICAL SECURITY FIXES - Phase 1 (Revised)
-- Fix high-priority security vulnerabilities without admin-only operations

-- 1. Enable RLS on esg_guidelines table (currently disabled)
ALTER TABLE public.esg_guidelines ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for esg_guidelines (authenticated users can read) - only if it doesn't exist
DROP POLICY IF EXISTS "Authenticated users can read ESG guidelines" ON public.esg_guidelines;
CREATE POLICY "Authenticated users can read ESG guidelines"
ON public.esg_guidelines
FOR SELECT
TO authenticated
USING (true);

-- 2. Drop views that might be exposing auth.users data
DROP VIEW IF EXISTS public.user_activity_summary CASCADE;
DROP VIEW IF EXISTS public.user_auth_details CASCADE;
DROP VIEW IF EXISTS public.auth_user_profiles CASCADE;

-- 3. Fix Function Search Path for remaining functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    dashboard_access,
    created_at, 
    updated_at
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user',
    true,
    now(), 
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.manually_verify_user(user_identifier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_record record;
BEGIN
    -- Find user by email or ID
    SELECT id, email, email_confirmed_at, confirmed_at, raw_user_meta_data
    INTO user_record
    FROM auth.users
    WHERE email = user_identifier OR id::text = user_identifier;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;
    
    -- Check if user is already verified
    IF user_record.email_confirmed_at IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User is already verified',
            'user_email', user_record.email
        );
    END IF;
    
    -- Update the user to mark as verified
    UPDATE auth.users
    SET 
        email_confirmed_at = now(),
        confirmed_at = DEFAULT,
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"email_verified": true}'::jsonb,
        updated_at = now()
    WHERE id = user_record.id;
    
    -- Return success result
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User successfully verified',
        'user_id', user_record.id,
        'user_email', user_record.email,
        'verified_at', now()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error verifying user: ' || SQLERRM
        );
END;
$$;

-- 4. Add audit logging for security fixes
SELECT public.log_security_event(
    'critical_security_fixes_applied',
    'database_migration',
    'phase_1_revised',
    true,
    'RLS enabled on esg_guidelines, function search paths secured, problematic views dropped'
);
