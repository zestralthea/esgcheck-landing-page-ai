-- Fix function search path mutable issue
-- Update the existing function to have a proper search path
CREATE OR REPLACE FUNCTION public.check_waitlist_rate_limit(
  user_email TEXT,
  user_ip INET DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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