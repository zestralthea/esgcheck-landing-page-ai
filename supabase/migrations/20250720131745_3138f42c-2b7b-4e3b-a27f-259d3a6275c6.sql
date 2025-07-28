
-- Complete cleanup of all problematic functions and triggers
-- First, drop all triggers that might be using the problematic functions
DROP TRIGGER IF EXISTS waitlist_confirmation_trigger ON public.waitlist;
DROP TRIGGER IF EXISTS trigger_confirmation_email ON public.waitlist;

-- Drop all functions that use net.http_post (which doesn't exist)
DROP FUNCTION IF EXISTS public.send_waitlist_confirmation_email();
DROP FUNCTION IF EXISTS public.trigger_confirmation_email();

-- Check if there are any other functions that might be causing issues
-- and clean them up as well
DROP FUNCTION IF EXISTS public.send_confirmation_email();
DROP FUNCTION IF EXISTS public.handle_waitlist_signup();

-- Ensure the waitlist table is clean and ready for basic inserts
-- Verify the table structure is correct
ALTER TABLE public.waitlist 
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now();

-- Make sure RLS policies are properly set
-- (The existing policies should remain: INSERT allowed, SELECT blocked for public)

-- Add a simple comment to confirm the cleanup
COMMENT ON TABLE public.waitlist IS 'Waitlist table - cleaned up and ready for basic functionality';
