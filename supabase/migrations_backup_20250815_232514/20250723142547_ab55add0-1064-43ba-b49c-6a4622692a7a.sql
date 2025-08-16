-- Fix remaining function search path issues for the older functions

-- Update the send_waitlist_confirmation function 
CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Insert a job into the background jobs table for email sending
    INSERT INTO public.background_jobs (
        job_type, 
        payload, 
        status
    ) VALUES (
        'send_waitlist_email',
        jsonb_build_object(
            'name', NEW.name,
            'email', NEW.email,
            'inserted_at', NOW()
        ),
        'pending'
    );

    RETURN NEW;
END;
$$;

-- Update the trigger_process_waitlist_emails function
CREATE OR REPLACE FUNCTION public.trigger_process_waitlist_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Invoke the Edge Function directly
  PERFORM pg_notify('process_waitlist_emails', new.id::text);
  RETURN new;
END;
$$;