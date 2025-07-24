-- Fix Role-Based Access Control Vulnerability
-- Remove the overly permissive profile update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create separate policies for different update scenarios
-- Allow users to update non-role fields only
CREATE POLICY "Users can update own profile except role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent role changes by regular users
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Only admins can update roles
CREATE POLICY "Admins can update any profile role" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

-- Fix waitlist admin access - allow admins to view waitlist
DROP POLICY IF EXISTS "No public read access" ON public.waitlist;

CREATE POLICY "Admins can view waitlist" 
ON public.waitlist 
FOR SELECT 
USING (is_admin());

-- Add rate limiting for waitlist signups (basic implementation)
-- Create a function to check recent signups from same IP/email
CREATE OR REPLACE FUNCTION public.check_waitlist_rate_limit(
  user_email TEXT,
  user_ip INET DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check for recent signups from same email (last 5 minutes)
  SELECT COUNT(*) INTO recent_count
  FROM public.waitlist
  WHERE email = user_email 
    AND created_at > (NOW() - INTERVAL '5 minutes');
  
  IF recent_count > 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Update waitlist insert policy to include rate limiting
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

CREATE POLICY "Rate limited waitlist signup" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (
  public.check_waitlist_rate_limit(email)
);