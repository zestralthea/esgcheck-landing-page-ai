-- Comprehensive Document Access Logging Implementation

-- First, enhance the document_access_logs table with additional fields for storage-level logging
ALTER TABLE public.document_access_logs ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.document_access_logs ADD COLUMN IF NOT EXISTS method TEXT; -- GET, POST, etc.
ALTER TABLE public.document_access_logs ADD COLUMN IF NOT EXISTS referer TEXT;
ALTER TABLE public.document_access_logs ADD COLUMN IF NOT EXISTS is_signed_url BOOLEAN DEFAULT false;
ALTER TABLE public.document_access_logs ADD COLUMN IF NOT EXISTS signed_url_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance on new columns
CREATE INDEX IF NOT EXISTS idx_document_access_logs_storage_path ON public.document_access_logs(storage_path);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_signed_url ON public.document_access_logs(is_signed_url, signed_url_expires_at);

-- Create function to log storage access events
CREATE OR REPLACE FUNCTION public.log_storage_access(
    storage_path_param TEXT,
    access_type_param TEXT DEFAULT 'download',
    user_id_param UUID DEFAULT NULL,
    success_param BOOLEAN DEFAULT true,
    error_msg TEXT DEFAULT NULL,
    method_param TEXT DEFAULT 'GET',
    referer_param TEXT DEFAULT NULL,
    is_signed_url_param BOOLEAN DEFAULT false,
    signed_url_expires_param TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    log_id UUID;
    doc_id UUID;
BEGIN
    -- Try to find the document by storage path
    SELECT id INTO doc_id 
    FROM public.documents 
    WHERE storage_path = storage_path_param;
    
    -- Insert access log (even if document not found in our records)
    INSERT INTO public.document_access_logs (
        document_id,
        user_id,
        access_type,
        success,
        error_message,
        storage_path,
        method,
        referer,
        is_signed_url,
        signed_url_expires_at
    ) VALUES (
        doc_id, -- May be NULL if document not found
        COALESCE(user_id_param, auth.uid()),
        access_type_param,
        success_param,
        error_msg,
        storage_path_param,
        method_param,
        referer_param,
        is_signed_url_param,
        signed_url_expires_param
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Create function to log signed URL generation
CREATE OR REPLACE FUNCTION public.log_signed_url_generation(
    doc_id UUID,
    expires_in_seconds INTEGER DEFAULT 3600,
    access_type_param TEXT DEFAULT 'signed_url_generated'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    log_id UUID;
    doc_storage_path TEXT;
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get document storage path
    SELECT storage_path INTO doc_storage_path 
    FROM public.documents 
    WHERE id = doc_id;
    
    -- Calculate expiration time
    expires_at := NOW() + (expires_in_seconds || ' seconds')::INTERVAL;
    
    -- Log the signed URL generation
    INSERT INTO public.document_access_logs (
        document_id,
        user_id,
        access_type,
        success,
        storage_path,
        method,
        is_signed_url,
        signed_url_expires_at
    ) VALUES (
        doc_id,
        auth.uid(),
        access_type_param,
        true,
        doc_storage_path,
        'SIGNED_URL_GEN',
        true,
        expires_at
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Create function to detect suspicious access patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_access(
    time_window_minutes INTEGER DEFAULT 10,
    max_access_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    user_id UUID,
    access_count BIGINT,
    distinct_documents BIGINT,
    first_access TIMESTAMP WITH TIME ZONE,
    last_access TIMESTAMP WITH TIME ZONE,
    suspicious_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dal.user_id,
        COUNT(*) as access_count,
        COUNT(DISTINCT dal.document_id) as distinct_documents,
        MIN(dal.accessed_at) as first_access,
        MAX(dal.accessed_at) as last_access,
        CASE 
            WHEN COUNT(*) > max_access_count THEN 100
            WHEN COUNT(*) > (max_access_count * 0.8) THEN 80
            WHEN COUNT(DISTINCT dal.document_id) < (COUNT(*) * 0.1) THEN 60 -- Same doc accessed many times
            ELSE 0
        END as suspicious_score
    FROM public.document_access_logs dal
    WHERE dal.accessed_at >= NOW() - (time_window_minutes || ' minutes')::INTERVAL
        AND dal.user_id IS NOT NULL
    GROUP BY dal.user_id
    HAVING COUNT(*) > (max_access_count * 0.5) -- Only return potentially suspicious activity
    ORDER BY access_count DESC, suspicious_score DESC;
END;
$$;

-- Create function to get comprehensive access audit trail
CREATE OR REPLACE FUNCTION public.get_document_audit_trail(
    doc_id UUID,
    limit_records INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    accessed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    user_email TEXT,
    access_type TEXT,
    success BOOLEAN,
    method TEXT,
    is_signed_url BOOLEAN,
    signed_url_expires_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    referer TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dal.id,
        dal.accessed_at,
        dal.user_id,
        p.email as user_email,
        dal.access_type,
        dal.success,
        dal.method,
        dal.is_signed_url,
        dal.signed_url_expires_at,
        dal.error_message,
        dal.ip_address,
        dal.user_agent,
        dal.referer
    FROM public.document_access_logs dal
    LEFT JOIN public.profiles p ON dal.user_id = p.id
    WHERE dal.document_id = doc_id
    ORDER BY dal.accessed_at DESC
    LIMIT limit_records;
END;
$$;

-- Create function to get access statistics
CREATE OR REPLACE FUNCTION public.get_access_statistics(
    time_period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_accesses BIGINT,
    unique_users BIGINT,
    unique_documents BIGINT,
    success_rate NUMERIC,
    signed_url_usage_rate NUMERIC,
    top_access_type TEXT,
    peak_hour INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total_accesses,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT document_id) as unique_documents,
            ROUND(
                (COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*)) * 100, 
                2
            ) as success_rate,
            ROUND(
                (COUNT(*) FILTER (WHERE is_signed_url = true)::NUMERIC / COUNT(*)) * 100, 
                2
            ) as signed_url_usage_rate,
            MODE() WITHIN GROUP (ORDER BY access_type) as top_access_type,
            MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM accessed_at)) as peak_hour
        FROM public.document_access_logs
        WHERE accessed_at >= NOW() - (time_period_days || ' days')::INTERVAL
    )
    SELECT * FROM stats;
END;
$$;

-- Update storage policies to be more restrictive and require logging
-- First, drop existing policies to recreate them with logging
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all documents" ON storage.objects;

-- Create enhanced storage policies that work with our document table
CREATE POLICY "Users can view their own documents or public documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' 
    AND (
        -- User owns the document
        (storage.foldername(name))[1] = auth.uid()::text
        OR 
        -- Document is public (check our documents table)
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.storage_path = name AND d.is_public = true
        )
        OR
        -- User is admin
        public.is_admin()
    )
);

CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'documents' 
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents' 
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);

-- Create a view for comprehensive access monitoring
CREATE OR REPLACE VIEW public.document_access_summary AS
SELECT 
    d.id as document_id,
    d.filename,
    d.user_id as owner_id,
    p.email as owner_email,
    d.is_public,
    COUNT(dal.id) as total_accesses,
    COUNT(DISTINCT dal.user_id) as unique_accessors,
    MAX(dal.accessed_at) as last_accessed,
    COUNT(dal.id) FILTER (WHERE dal.access_type = 'view') as view_count,
    COUNT(dal.id) FILTER (WHERE dal.access_type = 'download') as download_count,
    COUNT(dal.id) FILTER (WHERE dal.is_signed_url = true) as signed_url_accesses,
    COUNT(dal.id) FILTER (WHERE dal.success = false) as failed_accesses,
    ROUND(
        (COUNT(dal.id) FILTER (WHERE dal.success = true)::NUMERIC / NULLIF(COUNT(dal.id), 0)) * 100, 
        2
    ) as success_rate
FROM public.documents d
LEFT JOIN public.profiles p ON d.user_id = p.id
LEFT JOIN public.document_access_logs dal ON d.id = dal.document_id
GROUP BY d.id, d.filename, d.user_id, p.email, d.is_public;

-- Grant appropriate permissions
GRANT SELECT ON public.document_access_summary TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view summary of their own documents"
ON public.document_access_summary
FOR SELECT
TO authenticated
USING (
    owner_id = auth.uid() 
    OR public.is_admin()
    OR is_public = true
);