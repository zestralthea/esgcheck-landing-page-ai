-- Update the access_type check constraint to include all new access types
ALTER TABLE public.document_access_logs 
DROP CONSTRAINT document_access_logs_access_type_check;

ALTER TABLE public.document_access_logs 
ADD CONSTRAINT document_access_logs_access_type_check 
CHECK (access_type = ANY (ARRAY[
  'view'::text, 
  'download'::text, 
  'upload'::text, 
  'delete'::text, 
  'share'::text,
  'signed_url_view'::text,
  'signed_url_download'::text,
  'signed_url_view_failed'::text,
  'signed_url_download_failed'::text,
  'test_access'::text,
  'test_failure'::text
]));