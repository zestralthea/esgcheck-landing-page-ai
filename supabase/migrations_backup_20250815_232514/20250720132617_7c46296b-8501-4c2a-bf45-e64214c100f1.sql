
-- Create a trigger function to send confirmation emails when a user joins the waitlist
CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function to send confirmation email
  PERFORM net.http_post(
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

-- Create the trigger that fires after a new waitlist entry is inserted
CREATE TRIGGER waitlist_confirmation_trigger
  AFTER INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.send_waitlist_confirmation_email();
