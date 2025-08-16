-- Migration: Create ESG Guideline Embeddings Table
-- Description: Vector embeddings for semantic search and retrieval

CREATE TABLE esg_guideline_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_id uuid NOT NULL REFERENCES esg_guidelines(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  model_version text DEFAULT 'text-embedding-ada-002',
  dimension integer DEFAULT 1536,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(guideline_id, chunk_index)
);

-- Indexes
CREATE INDEX idx_embeddings_guideline ON esg_guideline_embeddings(guideline_id);
CREATE INDEX idx_embeddings_vector ON esg_guideline_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Vector search function
CREATE OR REPLACE FUNCTION search_guidelines(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  p_framework_code text DEFAULT NULL
)
RETURNS TABLE (
  guideline_id uuid,
  framework_code text,
  guideline_code text,
  title text,
  content text,
  chunk_index integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    f.code,
    g.code,
    g.title,
    ge.content,
    ge.chunk_index,
    1 - (ge.embedding <=> query_embedding) AS similarity
  FROM esg_guideline_embeddings ge
  JOIN esg_guidelines g ON g.id = ge.guideline_id
  JOIN esg_frameworks f ON f.id = g.framework_id
  WHERE 
    (p_framework_code IS NULL OR f.code = p_framework_code)
    AND 1 - (ge.embedding <=> query_embedding) > match_threshold
  ORDER BY ge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Comments
COMMENT ON TABLE esg_guideline_embeddings IS 'Vector embeddings for ESG guideline semantic search';
COMMENT ON FUNCTION search_guidelines IS 'Semantic search across guideline content returning top matches';