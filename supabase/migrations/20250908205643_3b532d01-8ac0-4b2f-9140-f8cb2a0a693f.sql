-- Create function to make a user admin (for testing purposes)
CREATE OR REPLACE FUNCTION public.make_user_admin(target_email text)
RETURNS json AS $$
DECLARE
  target_user_id uuid;
  result json;
BEGIN
  -- Check if current user is already admin or if this is the first user
  IF NOT is_admin() AND EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
    RETURN json_build_object('success', false, 'message', 'Only admins can grant admin access');
  END IF;
  
  -- Find user by email in profiles table
  SELECT id INTO target_user_id 
  FROM profiles 
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Update user role to admin
  UPDATE profiles 
  SET role = 'admin', updated_at = now() 
  WHERE id = target_user_id;
  
  RETURN json_build_object('success', true, 'message', 'User granted admin access', 'user_id', target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;