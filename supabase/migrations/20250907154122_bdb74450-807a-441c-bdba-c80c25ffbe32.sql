-- Fix documents table schema issues and cleanup duplicate columns

-- First, let's standardize the documents table structure
-- We'll keep the most appropriate column names and remove duplicates

-- Remove duplicate columns that are causing conflicts
ALTER TABLE public.documents DROP COLUMN IF EXISTS original_filename;
ALTER TABLE public.documents DROP COLUMN IF EXISTS uploaded_by;

-- Ensure the table has the correct structure
-- The user_id column should be the primary foreign key to users
-- Keep file_name as the main filename column

-- Add any missing constraints (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_user_id_fkey'
    AND table_name = 'documents'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.documents
      ADD CONSTRAINT documents_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add proper indexes for performance
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
