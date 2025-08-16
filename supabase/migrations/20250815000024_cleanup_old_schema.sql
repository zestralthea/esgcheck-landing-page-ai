-- Migration: Cleanup Old Schema
-- Description: Move legacy tables into backup schema and perform final maintenance.
-- NOTE:
--  - This is SAFE: it only moves tables that exist to legacy_backup.
--  - No destructive DROP TABLE commands are executed here.
--  - Keep legacy_backup for a while, then prune after verification.

-- 1) Ensure backup schema exists
CREATE SCHEMA IF NOT EXISTS legacy_backup;

-- 2) Move known legacy tables to backup schema if they still exist
DO $$
DECLARE
  tbl text;
  legacy_tables text[] := ARRAY[
    -- Lovable-era tables that may exist
    'waitlist',                    -- superseded by waitlist_entries
    'esg_report_analyses',         -- superseded by esg_analyses
    'esg_guideline_frameworks',    -- superseded by esg_frameworks
    'esg_guideline_chunks',        -- superseded by esg_guidelines + esg_guideline_embeddings
    -- Optional custom/temporary tables that may be present
    'document_access_logs_old',
    'feature_flags_old'
  ];
BEGIN
  FOREACH tbl IN ARRAY legacy_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('ALTER TABLE public.%I SET SCHEMA legacy_backup', tbl);
      RAISE NOTICE 'Moved table % to legacy_backup schema.', tbl;
    END IF;
  END LOOP;
END $$;

-- 3) Post-migration maintenance (manual)
-- Reindexing and VACUUM cannot run inside transactional migration pipelines.
-- If needed, run manually after deployment from a superuser session:
--   -- REINDEX DATABASE <your_database_name>;
--   -- VACUUM ANALYZE;

-- 4) Optional: preview sizes of major tables to validate storage expectations
-- (Use the monitoring view created earlier for better insight)
-- SELECT * FROM table_sizes ORDER BY total_bytes DESC;

COMMENT ON SCHEMA legacy_backup IS 'Backup of legacy tables preserved during migration. Review and drop when safe.';