-- Migration: Fix Hard-coded URLs in Database Trigger Functions
-- Date: 2024-12-10
-- Purpose: Replace hard-coded Supabase URLs with dynamic configuration
--
-- This migration updates the waitlist confirmation trigger function to use
-- PostgreSQL settings for the Supabase URL instead of hard-coding it.
-- This allows the same migration to work across different environments
-- (local, staging, production).
--
-- IMPORTANT: Before running this migration in each environment, ensure you have
-- set the app.settings.supabase_url configuration:
--
--   ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
--
-- For production: https://equtqvlukqloqphhmblj.supabase.co
-- For local dev: http://127.0.0.1:54321 (or your local Supabase instance)

-- Drop and recreate the function with dynamic URL support
CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  base_url TEXT;
  function_url TEXT;
  service_key TEXT;
BEGIN
  -- Get the Supabase URL from database settings
  -- If not set, this will raise an error to prevent silent failures
  BEGIN
    base_url := current_setting('app.settings.supabase_url', false);
  EXCEPTION 
    WHEN undefined_object THEN
      RAISE EXCEPTION 'app.settings.supabase_url is not configured. Please run: ALTER DATABASE postgres SET app.settings.supabase_url = ''https://your-project.supabase.co'';';
  END;

  -- Get the service role key from settings
  BEGIN
    service_key := current_setting('app.settings.service_role_key', false);
  EXCEPTION
    WHEN undefined_object THEN
      RAISE WARNING 'app.settings.service_role_key is not configured. Edge function call may fail.';
      service_key := 'missing-service-role-key';
  END;

  -- Construct the edge function URL
  function_url := base_url || '/functions/v1/send-waitlist-confirmation';

  -- Log the URL being called (for debugging)
  RAISE LOG 'Calling edge function at: %', function_url;

  -- Call the edge function to send confirmation email
  PERFORM extensions.net.http_post(
    url := function_url,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := json_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'company', NEW.company
    ),
    timeout := '10s'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the insert
    RAISE WARNING 'Failed to send waitlist confirmation email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the configuration requirement
COMMENT ON FUNCTION public.send_waitlist_confirmation_email() IS 
'Sends confirmation email when a user joins the waitlist. 
Requires app.settings.supabase_url to be configured in the database.
Run: ALTER DATABASE postgres SET app.settings.supabase_url = ''https://your-project.supabase.co'';';

-- Ensure the trigger exists (idempotent - safe to run multiple times)
DROP TRIGGER IF EXISTS waitlist_confirmation_trigger ON public.waitlist;

CREATE TRIGGER waitlist_confirmation_trigger
  AFTER INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.send_waitlist_confirmation_email();

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Trigger function now uses dynamic URLs';
  RAISE NOTICE 'Next step: Configure app.settings.supabase_url for your environment';
END $$;