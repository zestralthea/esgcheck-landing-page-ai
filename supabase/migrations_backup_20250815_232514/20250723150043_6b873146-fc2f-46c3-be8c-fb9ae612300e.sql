-- Fix the manually_verify_user function to handle Supabase's confirmed_at restrictions
CREATE OR REPLACE FUNCTION public.manually_verify_user(user_identifier text)
RETURNS jsonb AS $$
DECLARE
    user_record record;
    result jsonb;
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
    -- Note: confirmed_at can only be set to DEFAULT, not to now()
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';