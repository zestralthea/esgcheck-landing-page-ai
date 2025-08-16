-- Migration: Migrate Existing Data (Guarded/Idempotent)
-- Description: Safely migrate legacy tables into the new schema when present.
-- Notes:
--  - This script is defensive. It only migrates when legacy tables exist.
--  - It currently migrates waitlist -> waitlist_entries.
--  - Report/analysis migration is intentionally omitted to avoid conflicts with
--    the existing "esg_reports" table name in the new schema. We'll handle
--    report-level migration in a dedicated, manual step if needed.

DO $migration$
DECLARE
  has_waitlist BOOLEAN := FALSE;
  waitlist_count BIGINT := 0;
  migrated_count BIGINT := 0;
BEGIN
  -- Detect legacy public.waitlist table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'waitlist'
  ) INTO has_waitlist;

  IF has_waitlist THEN
    RAISE NOTICE 'Legacy table public.waitlist detected. Starting migration to waitlist_entries...';

    -- Count to be migrated
    EXECUTE 'SELECT COUNT(*) FROM public.waitlist' INTO waitlist_count;

    -- Migrate into new waitlist_entries (idempotent via unique email)
    EXECUTE $sql$
      INSERT INTO waitlist_entries (
        email,
        full_name,
        company_name,
        status,
        created_at,
        updated_at
      )
      SELECT
        w.email,
        COALESCE(NULLIF(w.name, ''), split_part(w.email, '@', 1)) AS full_name,
        w.company,
        'pending'::text,
        COALESCE(w.created_at, now()),
        COALESCE(w.created_at, now())
      FROM public.waitlist w
      ON CONFLICT (email) DO UPDATE
        SET 
          full_name   = EXCLUDED.full_name,
          company_name= EXCLUDED.company_name,
          updated_at  = now()
    $sql$;

    -- How many rows now in target per the source's email set
    EXECUTE $sql$
      SELECT COUNT(*)
      FROM waitlist_entries we
      WHERE we.email IN (SELECT email FROM public.waitlist)
    $sql$ INTO migrated_count;

    RAISE NOTICE 'Waitlist migration complete. Source rows: %, Target rows touched: %', waitlist_count, migrated_count;
  ELSE
    RAISE NOTICE 'Legacy table public.waitlist not found. Skipping waitlist migration.';
  END IF;

  RAISE NOTICE 'Data migration script completed.';
END;
$migration$ LANGUAGE plpgsql;