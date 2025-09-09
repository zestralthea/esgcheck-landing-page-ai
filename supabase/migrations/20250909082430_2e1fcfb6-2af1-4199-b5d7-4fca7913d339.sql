-- Create RPC function to get user reports with documents using proper JOIN
CREATE OR REPLACE FUNCTION public.get_user_reports_with_documents(user_id uuid)
RETURNS TABLE(
  report_id uuid,
  title text,
  report_title text,
  report_type text,
  status text,
  reporting_period_start date,
  reporting_period_end date,
  tags text[],
  created_at timestamp with time zone,
  filename text,
  file_name text,
  file_size bigint,
  storage_path text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as report_id,
    r.title,
    r.report_title,
    r.report_type,
    r.status,
    r.reporting_period_start,
    r.reporting_period_end,
    r.tags,
    r.created_at,
    d.filename,
    d.file_name,
    d.file_size,
    d.storage_path
  FROM esg_reports r
  LEFT JOIN documents d ON r.document_id = d.id
  WHERE r.user_id = get_user_reports_with_documents.user_id
    AND r.deleted_at IS NULL
  ORDER BY r.created_at DESC;
END;
$$;