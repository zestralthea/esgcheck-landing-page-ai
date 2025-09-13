-- CRITICAL SECURITY FIX: Phase 1 - Data Protection
-- Fix exposed waitlist entries (contains customer PII)

-- Enable RLS on waitlist_entries table
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Create admin-only access policies for waitlist
CREATE POLICY "Admins can view all waitlist entries" 
ON public.waitlist_entries 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert waitlist entries" 
ON public.waitlist_entries 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update waitlist entries" 
ON public.waitlist_entries 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete waitlist entries" 
ON public.waitlist_entries 
FOR DELETE 
USING (public.is_admin());

-- Allow public signup but only for insertions (rate limited)
CREATE POLICY "Public can join waitlist with rate limiting" 
ON public.waitlist_entries 
FOR INSERT 
WITH CHECK (public.check_waitlist_rate_limit(email));

-- Enable RLS on activity log partition tables (contains user tracking data) - only if they exist
DO $$
DECLARE
    partition_table text;
BEGIN
    FOREACH partition_table IN ARRAY ARRAY['activity_logs_2025_08', 'activity_logs_2025_09', 'activity_logs_2025_10']
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = partition_table) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', partition_table);
            EXECUTE format('CREATE POLICY "%s_select" ON public.%I FOR SELECT USING ((user_id = auth.uid()) OR public.is_admin())', partition_table, partition_table);
        END IF;
    END LOOP;
END $$;

-- Enable RLS on document access log partition tables (contains access patterns) - only if they exist
DO $$
DECLARE
    partition_table text;
BEGIN
    FOREACH partition_table IN ARRAY ARRAY['document_access_logs_2025_08', 'document_access_logs_2025_09', 'document_access_logs_2025_10']
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = partition_table) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', partition_table);
            EXECUTE format('CREATE POLICY "%s_select" ON public.%I FOR SELECT USING ((user_id = auth.uid()) OR public.is_admin())', partition_table, partition_table);
        END IF;
    END LOOP;
END $$;

-- Fix SECURITY DEFINER functions by adding proper search path
-- Update existing functions to be more secure
CREATE OR REPLACE FUNCTION public.get_document_access_summary(user_id_filter uuid DEFAULT NULL::uuid, include_public boolean DEFAULT true)
RETURNS TABLE(document_id uuid, filename text, owner_id uuid, owner_email text, is_public boolean, total_accesses bigint, unique_accessors bigint, last_accessed timestamp with time zone, view_count bigint, download_count bigint, signed_url_accesses bigint, failed_accesses bigint, success_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only allow admins or users viewing their own data
    IF NOT (public.is_admin() OR user_id_filter = auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: insufficient privileges';
    END IF;

    RETURN QUERY
    SELECT 
        d.id as document_id,
        d.file_name,
        d.user_id as owner_id,
        p.email as owner_email,
        d.is_public,
        COUNT(dal.id) as total_accesses,
        COUNT(DISTINCT dal.user_id) as unique_accessors,
        MAX(dal.accessed_at) as last_accessed,
        COUNT(dal.id) FILTER (WHERE dal.access_type = 'view') as view_count,
        COUNT(dal.id) FILTER (WHERE dal.access_type = 'download') as download_count,
        COUNT(dal.id) FILTER (WHERE dal.access_type = 'signed_url') as signed_url_accesses,
        COUNT(dal.id) FILTER (WHERE dal.success = false) as failed_accesses,
        ROUND(
            (COUNT(dal.id) FILTER (WHERE dal.success = true)::NUMERIC / NULLIF(COUNT(dal.id), 0)) * 100, 
            2
        ) as success_rate
    FROM public.documents d
    LEFT JOIN public.profiles p ON d.user_id = p.id
    LEFT JOIN public.document_access_logs dal ON d.id = dal.document_id
    WHERE (
        -- Admin can see all
        public.is_admin()
        OR
        -- User can see their own documents
        (user_id_filter IS NULL AND d.user_id = auth.uid())
        OR
        (user_id_filter IS NOT NULL AND d.user_id = user_id_filter AND d.user_id = auth.uid())
        OR
        -- Public documents if enabled
        (include_public AND d.is_public = true)
    )
    GROUP BY d.id, d.file_name, d.user_id, p.email, d.is_public
    ORDER BY d.created_at DESC;
END;
$$;

-- Create audit log for this security fix
INSERT INTO public.security_audit_log (
    user_id,
    action_type,
    resource_type,
    resource_id,
    success,
    error_message
) VALUES (
    auth.uid(),
    'SECURITY_FIX',
    'DATABASE_SCHEMA',
    'critical_data_protection_phase1',
    true,
    'Enabled RLS on waitlist_entries, activity_logs partitions, document_access_logs partitions'
);
