-- Fix documents table schema issues properly

-- Remove duplicate columns that are causing conflicts
ALTER TABLE public.documents DROP COLUMN IF EXISTS original_filename;
ALTER TABLE public.documents DROP COLUMN IF EXISTS uploaded_by;

-- Ensure we have the right column name for filename
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS filename text;

-- Update filename from file_name if it exists and filename is empty
UPDATE public.documents 
SET filename = file_name 
WHERE filename IS NULL AND file_name IS NOT NULL;

-- Drop file_name column if we successfully migrated data
-- ALTER TABLE public.documents DROP COLUMN IF EXISTS file_name;

-- Add proper indexes for performance (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON public.documents(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC) WHERE deleted_at IS NULL;

-- Ensure proper RLS policies are in place for documents
DROP POLICY IF EXISTS "Users can view own documents and public documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents, admins can update any" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents, admins can delete any" ON public.documents;

-- Create comprehensive RLS policies for documents
CREATE POLICY "Users can view own documents and public documents" ON public.documents
  FOR SELECT USING (
    user_id = auth.uid() OR 
    is_public = true OR 
    public.is_admin() OR
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can create their own documents" ON public.documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents, admins can update any" ON public.documents
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own documents, admins can delete any" ON public.documents
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());