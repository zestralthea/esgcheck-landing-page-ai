-- Create table for storing ESG report analysis results
CREATE TABLE IF NOT EXISTS esg_report_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES esg_reports(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  pdf_document_id VARCHAR NOT NULL,
  pdf_download_url VARCHAR,
  framework VARCHAR NOT NULL DEFAULT 'GRI',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_esg_report_analyses_report_id ON esg_report_analyses(report_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON esg_report_analyses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add RLS policies
ALTER TABLE esg_report_analyses ENABLE ROW LEVEL SECURITY;

-- Policy for read access
CREATE POLICY "Users can view their own report analyses" 
ON esg_report_analyses
FOR SELECT 
USING (
  report_id IN (
    SELECT id FROM esg_reports WHERE user_id = auth.uid()
  )
);

-- Policy for insert access
CREATE POLICY "Users can insert their own report analyses" 
ON esg_report_analyses
FOR INSERT 
WITH CHECK (
  report_id IN (
    SELECT id FROM esg_reports WHERE user_id = auth.uid()
  )
);

-- Policy for update access
CREATE POLICY "Users can update their own report analyses" 
ON esg_report_analyses
FOR UPDATE
USING (
  report_id IN (
    SELECT id FROM esg_reports WHERE user_id = auth.uid()
  )
);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON esg_report_analyses TO authenticated;