-- Comprehensive Database Schema Synchronization
-- Fix all missing tables, columns, and schema inconsistencies

-- 1. Create missing esg_report_analyses table
CREATE TABLE IF NOT EXISTS public.esg_report_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.esg_reports(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL DEFAULT '{}',
  pdf_document_id TEXT,
  pdf_download_url TEXT,
  framework TEXT NOT NULL DEFAULT 'GRI',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on esg_report_analyses
ALTER TABLE public.esg_report_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies for esg_report_analyses
CREATE POLICY "Users can view analyses for their organization reports" 
ON public.esg_report_analyses
FOR SELECT 
USING (
  report_id IN (
    SELECT id FROM public.esg_reports 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can insert analyses for their organization reports" 
ON public.esg_report_analyses
FOR INSERT 
WITH CHECK (
  report_id IN (
    SELECT id FROM public.esg_reports 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  )
);

-- 2. Add missing columns to existing tables

-- Add accessed_at to document_access_logs (alias created_at for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'document_access_logs' 
    AND column_name = 'accessed_at' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.document_access_logs ADD COLUMN accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    -- Update existing records
    UPDATE public.document_access_logs SET accessed_at = created_at WHERE accessed_at IS NULL;
  END IF;
END $$;

-- Add original_filename to documents table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' 
    AND column_name = 'original_filename' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN original_filename TEXT;
    -- Update existing records to use file_name as original_filename
    UPDATE public.documents SET original_filename = file_name WHERE original_filename IS NULL;
  END IF;
END $$;

-- Add user_id to documents table if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' 
    AND column_name = 'user_id' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add report_title to esg_reports (alias title for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'esg_reports' 
    AND column_name = 'report_title' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.esg_reports ADD COLUMN report_title TEXT;
    -- Update existing records
    UPDATE public.esg_reports SET report_title = title WHERE report_title IS NULL;
  END IF;
END $$;

-- Add user_id to esg_reports if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'esg_reports' 
    AND column_name = 'user_id' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.esg_reports ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add missing columns to profiles table
DO $$ 
BEGIN
  -- Add email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'email' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;

  -- Add role column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;

  -- Add dashboard_access column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'dashboard_access' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN dashboard_access BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 3. Update the handle_new_user function to populate profile data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    dashboard_access,
    created_at, 
    updated_at
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user',
    true,
    now(), 
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Clean up legacy RLS policies that reference legacy_backup schema
-- Drop problematic policies
DROP POLICY IF EXISTS "System can create ESG insights" ON public.esg_insights;
DROP POLICY IF EXISTS "Users can delete insights for their own reports" ON public.esg_insights;
DROP POLICY IF EXISTS "Users can update insights for their own reports" ON public.esg_insights;
DROP POLICY IF EXISTS "Users can view insights for their own reports" ON public.esg_insights;

DROP POLICY IF EXISTS "System can create ESG scores" ON public.esg_scores;
DROP POLICY IF EXISTS "Users can delete scores for their own reports" ON public.esg_scores;
DROP POLICY IF EXISTS "Users can update scores for their own reports" ON public.esg_scores;
DROP POLICY IF EXISTS "Users can view scores for their own reports" ON public.esg_scores;

-- Recreate with correct references
CREATE POLICY "Users can view insights for their organization reports" 
ON public.esg_insights
FOR SELECT 
USING (
  report_id IN (
    SELECT id FROM public.esg_reports 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage insights for their organization reports" 
ON public.esg_insights
FOR ALL
USING (
  report_id IN (
    SELECT id FROM public.esg_reports 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can view scores for their organization reports" 
ON public.esg_scores
FOR SELECT 
USING (
  report_id IN (
    SELECT id FROM public.esg_reports 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  )
);

CREATE POLICY "Users can manage scores for their organization reports" 
ON public.esg_scores
FOR ALL
USING (
  report_id IN (
    SELECT id FROM public.esg_reports 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  )
);

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_esg_report_analyses_report_id ON public.esg_report_analyses(report_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_accessed_at ON public.document_access_logs(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 6. Add updated_at triggers
CREATE TRIGGER update_esg_report_analyses_updated_at
    BEFORE UPDATE ON public.esg_report_analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Populate missing data for existing records
-- Update profiles with email from auth.users where missing
UPDATE public.profiles 
SET email = (
  SELECT email FROM auth.users WHERE auth.users.id = profiles.id
)
WHERE email IS NULL;

COMMENT ON TABLE public.esg_report_analyses IS 'ESG report analysis results and PDF exports';
COMMENT ON COLUMN public.document_access_logs.accessed_at IS 'Timestamp when document was accessed (for backward compatibility)';
COMMENT ON COLUMN public.documents.original_filename IS 'Original filename when uploaded';
COMMENT ON COLUMN public.esg_reports.report_title IS 'Report title (for backward compatibility)';