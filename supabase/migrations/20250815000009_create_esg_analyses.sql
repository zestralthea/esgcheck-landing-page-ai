-- Migration: Create ESG Analyses Table
-- Description: AI analysis results for ESG reports

CREATE TABLE esg_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id) ON DELETE CASCADE,
  analysis_version integer NOT NULL DEFAULT 1,
  framework_used text NOT NULL,
  ai_model text NOT NULL,
  environmental_score decimal(5,2) CHECK (environmental_score BETWEEN 0 AND 100),
  social_score decimal(5,2) CHECK (social_score BETWEEN 0 AND 100),
  governance_score decimal(5,2) CHECK (governance_score BETWEEN 0 AND 100),
  overall_score decimal(5,2) GENERATED ALWAYS AS (
    (COALESCE(environmental_score,0) + COALESCE(social_score,0) + COALESCE(governance_score,0))/3
  ) STORED,
  material_topics jsonb DEFAULT '[]',
  identified_gaps jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  risk_assessment jsonb DEFAULT '{}',
  full_analysis jsonb NOT NULL,
  confidence_score decimal(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
  processing_time_ms integer,
  is_latest boolean DEFAULT false,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(report_id, analysis_version)
);

-- Indexes
CREATE UNIQUE INDEX idx_esg_analyses_latest ON esg_analyses(report_id) WHERE is_latest = true AND deleted_at IS NULL;
CREATE INDEX idx_esg_analyses_report ON esg_analyses(report_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_analyses_report_latest_score ON esg_analyses(report_id, is_latest, overall_score) WHERE deleted_at IS NULL;
CREATE INDEX idx_esg_analyses_created ON esg_analyses(created_at DESC) WHERE deleted_at IS NULL;

-- Latest analysis management trigger
CREATE OR REPLACE FUNCTION set_latest_analysis()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_latest = true THEN
    UPDATE esg_analyses 
    SET is_latest = false 
    WHERE report_id = NEW.report_id 
      AND is_latest = true 
      AND id != NEW.id
      AND deleted_at IS NULL;
  END IF;
  
  IF NEW.is_latest IS NULL THEN
    NEW.is_latest = NOT EXISTS (
      SELECT 1 FROM esg_analyses 
      WHERE report_id = NEW.report_id 
        AND deleted_at IS NULL
        AND id != NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_latest_analysis
  BEFORE INSERT OR UPDATE ON esg_analyses
  FOR EACH ROW
  EXECUTE FUNCTION set_latest_analysis();

-- Comments
COMMENT ON TABLE esg_analyses IS 'AI-generated analysis results for ESG reports';
COMMENT ON COLUMN esg_analyses.is_latest IS 'Marks the most recent analysis per report';