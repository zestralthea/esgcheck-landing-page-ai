-- Fix function overloading conflict in match_guideline_chunks
-- The error was: "Could not choose the best candidate function between: 
-- public.match_guideline_chunks(query_embedding => extensions.vector, match_threshold => double precision, match_count => integer, framework_name => character varying), 
-- public.match_guideline_chunks(query_embedding => extensions.vector, match_threshold => double precision, match_count => integer, framework_name => text)"

-- First, drop both implementations of the function to clean slate
DROP FUNCTION IF EXISTS public.match_guideline_chunks(extensions.vector, double precision, integer, character varying);
DROP FUNCTION IF EXISTS public.match_guideline_chunks(extensions.vector, double precision, integer, text);

-- Then create a single, clean implementation that uses TEXT consistently
-- TEXT is preferred over CHARACTER VARYING as it's more flexible in PostgreSQL
CREATE OR REPLACE FUNCTION public.match_guideline_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  framework_name TEXT DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  content TEXT,
  embedding VECTOR(1536),
  similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    gc.id,
    gc.content,
    gc.embedding,
    1 - (gc.embedding <=> query_embedding) AS similarity
  FROM
    guideline_chunks gc
  WHERE
    -- Apply framework filter only if provided
    (framework_name IS NULL OR gc.framework = framework_name)
    -- Ensure minimum similarity threshold
    AND (1 - (gc.embedding <=> query_embedding)) > match_threshold
  ORDER BY
    -- Sort by similarity (most similar first)
    gc.embedding <=> query_embedding
  LIMIT
    -- Return at most match_count results
    match_count;
END;
$$;

-- For robustness, let's also verify the type we're using in the table definition
-- Making sure framework column is consistently using TEXT
ALTER TABLE IF EXISTS guideline_chunks 
  ALTER COLUMN framework TYPE TEXT;

-- Add a comment explaining the purpose of the function for future maintenance
COMMENT ON FUNCTION public.match_guideline_chunks IS 'Performs semantic search on guideline chunks using vector similarity. Returns chunks above the similarity threshold, optionally filtered by framework name.';