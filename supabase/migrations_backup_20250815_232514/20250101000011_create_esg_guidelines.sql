-- Migration: Create ESG Guidelines Table
-- Description: Specific guidelines within each framework

CREATE TABLE esg_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES esg_frameworks(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  category text CHECK (category IN ('environmental', 'social', 'governance', 'general')),
  description text,
  requirements text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(framework_id, code)
);

-- Indexes
CREATE INDEX idx_guidelines_framework ON esg_guidelines(framework_id);
CREATE INDEX idx_guidelines_category ON esg_guidelines(category);
CREATE INDEX idx_guidelines_code ON esg_guidelines(code);

-- Comments
COMMENT ON TABLE esg_guidelines IS 'Specific guidelines and requirements within frameworks';