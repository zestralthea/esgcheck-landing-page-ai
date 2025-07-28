-- Enable the pgvector extension for embeddings-based similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for ESG guidelines frameworks
CREATE TABLE IF NOT EXISTS esg_guideline_frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for ESG guideline chunks with vector embeddings
CREATE TABLE IF NOT EXISTS esg_guideline_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id UUID REFERENCES esg_guideline_frameworks(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- For text-embedding-3-small model
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster embedding-based searches
CREATE INDEX IF NOT EXISTS idx_esg_guideline_chunks_embedding ON esg_guideline_chunks USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- Create the match_guideline_chunks function for similarity search
CREATE OR REPLACE FUNCTION match_guideline_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  framework_name VARCHAR
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.content,
    1 - (c.embedding <-> query_embedding) AS similarity
  FROM
    esg_guideline_chunks c
  JOIN
    esg_guideline_frameworks f ON c.framework_id = f.id
  WHERE
    f.name = framework_name
  AND
    1 - (c.embedding <-> query_embedding) > match_threshold
  ORDER BY
    c.embedding <-> query_embedding
  LIMIT
    match_count;
END;
$$;

-- Insert sample GRI framework
INSERT INTO esg_guideline_frameworks (name, description)
VALUES ('GRI', 'Global Reporting Initiative Standards') 
ON CONFLICT (name) DO NOTHING;

-- Insert sample guideline chunks (without embeddings for now)
INSERT INTO esg_guideline_chunks (framework_id, title, content, metadata)
VALUES 
  ((SELECT id FROM esg_guideline_frameworks WHERE name = 'GRI'), 
   'GRI 102: General Disclosures',
   'GRI 102 addresses general disclosures on organizational profile, strategy, ethics and integrity, governance, stakeholder engagement, and reporting practice. Organizations should disclose their organizational details, including size, location, activities, and governance structure.',
   '{"standard": "GRI 102", "section": "General Disclosures"}'),
   
  ((SELECT id FROM esg_guideline_frameworks WHERE name = 'GRI'), 
   'GRI 201: Economic Performance',
   'GRI 201 covers economic performance disclosures. Organizations should report on direct economic value generated and distributed, financial implications of climate change, defined benefit plan obligations, and financial assistance received from government.',
   '{"standard": "GRI 201", "section": "Economic Performance"}'),
   
  ((SELECT id FROM esg_guideline_frameworks WHERE name = 'GRI'), 
   'GRI 302: Energy',
   'GRI 302 addresses energy consumption and efficiency. Organizations should disclose energy consumption within the organization, energy consumption outside the organization, energy intensity, reduction of energy consumption, and reductions in energy requirements of products and services.',
   '{"standard": "GRI 302", "section": "Environmental"}'),
   
  ((SELECT id FROM esg_guideline_frameworks WHERE name = 'GRI'), 
   'GRI 305: Emissions',
   'GRI 305 covers emissions disclosures. Organizations should report on direct (Scope 1) GHG emissions, energy indirect (Scope 2) GHG emissions, other indirect (Scope 3) GHG emissions, GHG emissions intensity, reduction of GHG emissions, and emissions of ozone-depleting substances and other significant air emissions.',
   '{"standard": "GRI 305", "section": "Environmental"}'),
   
  ((SELECT id FROM esg_guideline_frameworks WHERE name = 'GRI'), 
   'GRI 401: Employment',
   'GRI 401 addresses employment practices. Organizations should disclose new employee hires and employee turnover, benefits provided to full-time employees, and parental leave metrics including return to work and retention rates after parental leave.',
   '{"standard": "GRI 401", "section": "Social"}'),
   
  ((SELECT id FROM esg_guideline_frameworks WHERE name = 'GRI'), 
   'GRI 403: Occupational Health and Safety',
   'GRI 403 covers occupational health and safety. Organizations should report on occupational health and safety management systems, hazard identification and risk assessment, occupational health services, worker participation in health and safety, worker training on health and safety, and work-related injuries and ill health.',
   '{"standard": "GRI 403", "section": "Social"}'),
   
  ((SELECT id FROM esg_guideline_frameworks WHERE name = 'GRI'), 
   'GRI 405: Diversity and Equal Opportunity',
   'GRI 405 addresses diversity and equal opportunity. Organizations should disclose the diversity of governance bodies and employees by gender, age group, and other indicators of diversity. They should also report the ratio of basic salary and remuneration of women to men.',
   '{"standard": "GRI 405", "section": "Social"}'
  );

-- Add triggers to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_esg_guideline_frameworks
BEFORE UPDATE ON esg_guideline_frameworks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_esg_guideline_chunks
BEFORE UPDATE ON esg_guideline_chunks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add RLS policies
ALTER TABLE esg_guideline_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_guideline_chunks ENABLE ROW LEVEL SECURITY;

-- Policy for read access to frameworks (allow all authenticated users)
CREATE POLICY "Anyone can read guideline frameworks" 
ON esg_guideline_frameworks
FOR SELECT 
USING (true);

-- Policy for read access to chunks (allow all authenticated users)
CREATE POLICY "Anyone can read guideline chunks" 
ON esg_guideline_chunks
FOR SELECT 
USING (true);

-- Grant permissions
GRANT SELECT ON esg_guideline_frameworks TO authenticated;
GRANT SELECT ON esg_guideline_chunks TO authenticated;