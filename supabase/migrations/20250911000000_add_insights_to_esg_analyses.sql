-- Migration: Add insights field to esg_analyses table
-- Description: Consolidate insights into the main esg_analyses table

-- Add insights field to esg_analyses table
ALTER TABLE esg_analyses
ADD COLUMN insights jsonb DEFAULT '[]';

-- Add comment
COMMENT ON COLUMN esg_analyses.insights IS 'AI-generated insights array with types: strength, weakness, opportunity, risk, recommendation, benchmark';

-- Create index for insights queries
CREATE INDEX idx_esg_analyses_insights ON esg_analyses USING gin(insights) WHERE deleted_at IS NULL;

-- Update existing records to have empty insights array if they don't have any
UPDATE esg_analyses
SET insights = '[]'::jsonb
WHERE insights IS NULL AND deleted_at IS NULL;
