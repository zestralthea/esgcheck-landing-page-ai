-- Add missing column to document_access_logs table
ALTER TABLE public.document_access_logs ADD COLUMN IF NOT EXISTS is_signed_url boolean DEFAULT false;

-- Create storage policies for secure document access
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND (
    -- User owns the document
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Document is public
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE storage_path = name 
      AND is_public = true
    )
    OR
    -- User is admin
    public.is_admin()
  )
);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
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
USING (
  bucket_id = 'documents' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin()
  )
);