
-- Step 1: Remove the problematic trigger and function
DROP TRIGGER IF EXISTS waitlist_confirmation_trigger ON public.waitlist;
DROP FUNCTION IF EXISTS public.send_waitlist_confirmation_email();

-- Step 2: Configure the service role key setting for the trigger
ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxdXRxdmx1a3Fsb3FwaGhtYmxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY5OTgxMSwiZXhwIjoyMDY4Mjc1ODExfQ.y_bLLKK6_yG7EDYBfDgcKKMZZhC3K_UQJ7iUIl5_KXM';

-- Step 3: Create the corrected function with proper schema reference
CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function to send confirmation email using the correct schema
  PERFORM extensions.net.http_post(
    url := 'https://equtqvlukqloqphhmblj.supabase.co/functions/v1/send-waitlist-confirmation',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := json_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'company', NEW.company
    ),
    timeout := '10s'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Recreate the trigger
CREATE TRIGGER waitlist_confirmation_trigger
  AFTER INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.send_waitlist_confirmation_email();
