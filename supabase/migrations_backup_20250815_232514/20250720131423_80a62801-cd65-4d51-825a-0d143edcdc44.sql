
-- Remove the problematic trigger and function that's causing the insertion to fail
DROP TRIGGER IF EXISTS waitlist_confirmation_trigger ON public.waitlist;
DROP FUNCTION IF EXISTS public.send_waitlist_confirmation_email();

-- Also remove the other trigger function that's not being used
DROP FUNCTION IF EXISTS public.trigger_confirmation_email();
