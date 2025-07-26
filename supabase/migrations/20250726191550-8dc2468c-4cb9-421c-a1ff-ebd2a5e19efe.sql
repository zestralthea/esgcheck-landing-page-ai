-- SECURITY FIX: Remove service role key from triggers and use secure background job pattern

-- Drop the old insecure trigger and function that contained service role keys
DROP TRIGGER IF EXISTS send_waitlist_confirmation_trigger ON public.waitlist;
DROP FUNCTION IF EXISTS public.send_waitlist_confirmation_email();

-- The secure pattern is already implemented with background_jobs table and send_waitlist_confirmation trigger
-- This migration ensures no service role keys are exposed in database functions

-- Verify the secure background job pattern is working
-- The existing send_waitlist_confirmation() trigger function uses background_jobs table
-- which is the secure pattern we want

-- Add additional audit logging for security
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Admins can view all security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert security audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    action_type_param TEXT,
    resource_type_param TEXT,
    resource_id_param TEXT DEFAULT NULL,
    success_param BOOLEAN DEFAULT true,
    error_msg TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        action_type,
        resource_type,
        resource_id,
        success,
        error_message
    ) VALUES (
        auth.uid(),
        action_type_param,
        resource_type_param,
        resource_id_param,
        success_param,
        error_msg
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;