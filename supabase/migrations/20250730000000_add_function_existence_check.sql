-- Create a utility function to check if a specific function exists
-- This helps edge functions diagnose issues with required database functions

CREATE OR REPLACE FUNCTION check_function_exists(function_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  function_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE p.proname = function_name
  ) INTO function_exists;
  
  RETURN function_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add fallback implementation of match_guideline_chunks if it doesn't exist
-- This ensures the analyze-esg-report function won't fail catastrophically
DO $BLOCK$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE p.proname = 'match_guideline_chunks'
  ) THEN
    -- Create a simple fallback function that returns an empty result
    CREATE OR REPLACE FUNCTION match_guideline_chunks(
      query_embedding VECTOR(1536),
      match_threshold FLOAT,
      match_count INT,
      framework_name TEXT
    )
    RETURNS TABLE (
      id UUID,
      content TEXT,
      embedding VECTOR(1536),
      similarity FLOAT
    ) AS $FALLBACK$
    BEGIN
      -- This is a fallback implementation that returns an empty result set
      -- The real implementation is in 20250729000000_add_esg_guidelines_and_vector_search.sql
      RETURN QUERY
      SELECT 
        uuid_nil()::UUID as id,
        'No matching guidelines found. This is a fallback implementation.' as content,
        '{}'::VECTOR(1536) as embedding,
        0.0::FLOAT as similarity
      WHERE FALSE;
    END;
    $FALLBACK$ LANGUAGE plpgsql SECURITY DEFINER;

    RAISE NOTICE 'Created fallback match_guideline_chunks function since the real implementation was not found';
  ELSE
    RAISE NOTICE 'match_guideline_chunks function already exists';
  END IF;
END
$BLOCK$;