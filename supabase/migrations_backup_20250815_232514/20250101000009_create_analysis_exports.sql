-- Migration: Create ESG Analysis Exports Table
-- Description: Track generated export files (PDF, Excel, etc.)

CREATE TABLE esg_analysis_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES esg_analyses(id) ON DELETE CASCADE,
  export_type text NOT NULL CHECK (export_type IN ('pdf', 'excel', 'word', 'json')),
  storage_path text,
  external_document_id text,
  generation_status text DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  expires_at timestamptz,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_analysis_exports_analysis ON esg_analysis_exports(analysis_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_analysis_exports_status ON esg_analysis_exports(generation_status) 
  WHERE generation_status IN ('pending', 'processing') AND deleted_at IS NULL;
CREATE INDEX idx_analysis_exports_created ON esg_analysis_exports(created_at DESC) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE esg_analysis_exports IS 'Generated export files for analyses';
COMMENT ON COLUMN esg_analysis_exports.external_document_id IS 'External service ID (e.g., PDFMonkey)';