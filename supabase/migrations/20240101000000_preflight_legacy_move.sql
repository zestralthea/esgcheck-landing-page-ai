-- Migration: Preflight legacy move (non-destructive)
-- Description:
--   Move any existing legacy tables out of the public schema into legacy_backup BEFORE creating our new clean schema.
--   This avoids name collisions (e.g., public.esg_reports already exists).
--   Safe to run multiple times (checks existence before moving).

-- 1) Ensure backup schema exists
CREATE SCHEMA IF NOT EXISTS legacy_backup;

-- Ensure required extensions are available early for downstream migrations
-- Some earlier migrations rely on gen_random_uuid() or uuid_generate_v4()
-- Having these enabled here avoids ordering issues during supabase start
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- provides gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- provides uuid_generate_v4()

-- 2) Helper: function to move a table if it exists in public
DO $$
DECLARE
  tbl text;
  existing boolean;
  backup_exists boolean;
  ts_suffix text := to_char(now(), 'YYYYMMDDHH24MISS');
  tables_to_move text[] := ARRAY[
    -- Common legacy tables seen in this project:
    'waitlist',
    'documents',
    'esg_reports',
    'esg_report_analyses',
    'esg_guideline_frameworks',
    'esg_guideline_chunks',
    'document_access_logs',
    'activity_logs',
    'feature_flags',
    'feature_flag_users',
    'feature_flag_organizations',
    'system_settings',
    -- Any other leftover tables that could collide:
    'profiles',
    'organizations',
    'organization_members'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_to_move LOOP
    -- Check if the table exists in public
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = tbl
    ) INTO existing;

    IF existing THEN
      -- If the same name already exists in legacy_backup, rename it out of the way first
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'legacy_backup'
          AND table_name = tbl
      ) INTO backup_exists;

      IF backup_exists THEN
        EXECUTE format(
          'ALTER TABLE legacy_backup.%I RENAME TO %I',
          tbl,
          tbl || '_prev_' || ts_suffix
        );
      END IF;

      -- Move the public table into legacy_backup
      EXECUTE format('ALTER TABLE public.%I SET SCHEMA legacy_backup', tbl);
      RAISE NOTICE 'Moved public.% to legacy_backup.%', tbl, tbl;

      -- Intentionally do NOT rename the moved table if the name didn't collide.
      -- This avoids "relation already exists" errors when renaming to the same name.
    END IF;
  END LOOP;
END $$;

-- 3) Optional: create a note table in backup schema to log the migration run
CREATE TABLE IF NOT EXISTS legacy_backup.migration_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO legacy_backup.migration_notes(note)
VALUES ('Preflight legacy move executed to prevent naming collisions with new clean schema.');
