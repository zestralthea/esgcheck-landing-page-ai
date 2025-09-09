-- Create RPC function to get user reports with documents using proper JOIN
CREATE OR REPLACE FUNCTION get_user_reports_with_documents(user_id UUID)
RETURNS TABLE (
  report_id UUID,
  title TEXT,
  report_title TEXT,
  report_type TEXT,
  status TEXT,
  reporting_period_start DATE,
  reporting_period_end DATE,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  filename TEXT,
  file_name TEXT,
  file_size BIGINT,
  storage_path TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
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
  WHERE r.user_id = $1
  ORDER BY r.created_at DESC;
$$;