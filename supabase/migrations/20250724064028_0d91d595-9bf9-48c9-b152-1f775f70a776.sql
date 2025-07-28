-- Create documents table for file metadata and ownership
CREATE TABLE public.documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    description TEXT,
    tags TEXT[],
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document access logs table for audit trail
CREATE TABLE public.document_access_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'upload', 'delete', 'share')),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents table
-- Users can view their own documents or public documents
CREATE POLICY "Users can view own documents and public documents" 
ON public.documents 
FOR SELECT 
USING (user_id = auth.uid() OR is_public = true OR is_admin());

-- Users can insert their own documents
CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own documents, admins can update any
CREATE POLICY "Users can update own documents, admins can update any" 
ON public.documents 
FOR UPDATE 
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- Users can delete their own documents, admins can delete any
CREATE POLICY "Users can delete own documents, admins can delete any" 
ON public.documents 
FOR DELETE 
USING (user_id = auth.uid() OR is_admin());

-- RLS Policies for document_access_logs table
-- Users can view logs for their own documents, admins can view all
CREATE POLICY "Users can view logs for own documents, admins can view all" 
ON public.document_access_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.documents 
        WHERE documents.id = document_access_logs.document_id 
        AND (documents.user_id = auth.uid() OR is_admin())
    )
);

-- Only the system (via service role) should insert access logs
CREATE POLICY "System can insert access logs" 
ON public.document_access_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_documents_tags ON public.documents USING GIN(tags);
CREATE INDEX idx_document_access_logs_document_id ON public.document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_accessed_at ON public.document_access_logs(accessed_at DESC);

-- Create updated_at trigger for documents
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);

-- Storage policies for documents bucket
-- Users can upload their own documents
CREATE POLICY "Users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own documents, admins can view all
CREATE POLICY "Users can view own documents, admins can view all" 
ON storage.objects 
FOR SELECT 
USING (
    bucket_id = 'documents' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1] 
        OR is_admin()
    )
);

-- Users can update their own documents, admins can update all
CREATE POLICY "Users can update own documents, admins can update all" 
ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'documents' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1] 
        OR is_admin()
    )
);

-- Users can delete their own documents, admins can delete all
CREATE POLICY "Users can delete own documents, admins can delete all" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'documents' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1] 
        OR is_admin()
    )
);

-- Create function to log document access
CREATE OR REPLACE FUNCTION public.log_document_access(
    doc_id UUID,
    access_type_param TEXT,
    success_param BOOLEAN DEFAULT true,
    error_msg TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.document_access_logs (
        document_id,
        user_id,
        access_type,
        success,
        error_message
    ) VALUES (
        doc_id,
        auth.uid(),
        access_type_param,
        success_param,
        error_msg
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;