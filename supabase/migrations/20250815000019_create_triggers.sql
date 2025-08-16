-- Migration: Create Triggers
-- Description: Set up automatic updated_at triggers and soft-delete cascade

-- Auto-update timestamps for all tables that have an updated_at column (skip partitioned logs)
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
      AND table_schema = 'public'
      AND table_name NOT LIKE '%\_logs%' ESCAPE '\'
  LOOP
    EXECUTE format('
      DO $inner$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_trigger 
          WHERE tgname = %L
        ) THEN
          EXECUTE %L;
        END IF;
      END
      $inner$;',
      'update_' || t || '_updated_at',
      format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', 'update_' || t || '_updated_at', t)
    );
  END LOOP;
END $$;

-- Soft delete cascade trigger for reports (analyses + exports)
DROP TRIGGER IF EXISTS cascade_report_soft_delete ON esg_reports;

CREATE TRIGGER cascade_report_soft_delete
  AFTER UPDATE ON esg_reports
  FOR EACH ROW
  WHEN (NEW.deleted_at IS DISTINCT FROM OLD.deleted_at)
  EXECUTE FUNCTION soft_delete_report_cascade();

-- Helpful comments
COMMENT ON TRIGGER cascade_report_soft_delete ON esg_reports IS 'Cascade soft deletes to related analyses and exports when report is soft-deleted';