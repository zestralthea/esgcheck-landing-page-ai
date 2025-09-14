-- Migration: Cleanup redundant ESG tables after consolidation
-- Description: Remove esg_insights and esg_report_analyses tables as insights are now in esg_analyses

-- First, migrate any existing data from esg_insights to esg_analyses.insights
-- This is a safety measure in case there's any data in the old table
DO $$
DECLARE
    insight_record RECORD;
    analysis_record RECORD;
    insights_array jsonb := '[]'::jsonb;
BEGIN
    -- For each analysis that might have insights in the old table
    FOR analysis_record IN 
        SELECT DISTINCT ea.id, ea.report_id 
        FROM esg_analyses ea
        WHERE ea.deleted_at IS NULL
    LOOP
        -- Reset insights array for this analysis
        insights_array := '[]'::jsonb;
        
        -- Collect all insights for this report
        FOR insight_record IN
            SELECT ei.*
            FROM esg_insights ei
            WHERE ei.report_id = analysis_record.report_id
            ORDER BY 
                CASE ei.priority 
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END,
                COALESCE(ei.impact_score, 0) DESC
        LOOP
            -- Add insight to array with proper structure
            insights_array := insights_array || jsonb_build_object(
                'type', insight_record.insight_type,
                'title', insight_record.title,
                'description', insight_record.description,
                'priority', insight_record.priority,
                'category', insight_record.category,
                'actionable', COALESCE(insight_record.actionable, true),
                'impact_score', insight_record.impact_score,
                'implementation_effort', insight_record.implementation_effort,
                'gri_reference', insight_record.gri_reference
            );
        END LOOP;
        
        -- Update the analysis with consolidated insights if we found any
        IF jsonb_array_length(insights_array) > 0 THEN
            UPDATE esg_analyses 
            SET insights = insights_array,
                updated_at = now()
            WHERE id = analysis_record.id;
            
            RAISE NOTICE 'Migrated % insights for analysis %', jsonb_array_length(insights_array), analysis_record.id;
        END IF;
    END LOOP;
END $$;

-- Drop the redundant tables (with CASCADE to handle foreign keys)
DROP TABLE IF EXISTS esg_insights CASCADE;
DROP TABLE IF EXISTS esg_report_analyses CASCADE;

-- Add helpful comment
COMMENT ON COLUMN esg_analyses.insights IS 'Consolidated AI-generated insights array. Replaces the old esg_insights table for better performance and data consistency.';

-- Create a view for backward compatibility if needed (optional)
-- This can help during transition period
CREATE OR REPLACE VIEW esg_insights_view AS
SELECT 
    ea.id as analysis_id,
    ea.report_id,
    (insight->>'type')::text as insight_type,
    (insight->>'title')::text as title,
    (insight->>'description')::text as description,
    (insight->>'priority')::text as priority,
    (insight->>'category')::text as category,
    COALESCE((insight->>'actionable')::boolean, true) as actionable,
    (insight->>'impact_score')::numeric as impact_score,
    (insight->>'implementation_effort')::text as implementation_effort,
    (insight->>'gri_reference')::text as gri_reference,
    ea.created_at,
    ea.updated_at
FROM esg_analyses ea,
     jsonb_array_elements(ea.insights) as insight
WHERE ea.deleted_at IS NULL
  AND ea.insights IS NOT NULL
  AND jsonb_array_length(ea.insights) > 0;

COMMENT ON VIEW esg_insights_view IS 'Backward compatibility view that expands insights from esg_analyses.insights jsonb column';
