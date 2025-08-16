-- Migration: Create Documents Table
-- Description: Central document storage and management

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size >= 0),
  storage_path text UNIQUE NOT NULL,
  mime_type text,
  checksum text,
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_documents_org ON documents(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by) WHERE uploaded_by IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_documents_checksum ON documents(checksum) WHERE checksum IS NOT NULL;
CREATE INDEX idx_documents_created ON documents(created_at DESC) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE documents IS 'Central document storage tracking';
COMMENT ON COLUMN documents.storage_path IS 'Path in storage bucket';
COMMENT ON COLUMN documents.checksum IS 'SHA256 hash for deduplication';