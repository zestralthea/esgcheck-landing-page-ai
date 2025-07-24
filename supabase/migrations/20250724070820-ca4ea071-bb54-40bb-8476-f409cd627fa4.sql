-- Create a function to get document access summary
CREATE OR REPLACE FUNCTION public.get_document_access_summary(
    user_id_filter UUID DEFAULT NULL,
    include_public BOOLEAN DEFAULT true
)
RETURNS TABLE (
    document_id UUID,
    filename TEXT,
    owner_id UUID,
    owner_email TEXT,
    is_public BOOLEAN,
    total_accesses BIGINT,
    unique_accessors BIGINT,
    last_accessed TIMESTAMP WITH TIME ZONE,
    view_count BIGINT,
    download_count BIGINT,
    signed_url_accesses BIGINT,
    failed_accesses BIGINT,
    success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
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
    GROUP BY d.id, d.filename, d.user_id, p.email, d.is_public
    ORDER BY d.created_at DESC;
END;
$$;