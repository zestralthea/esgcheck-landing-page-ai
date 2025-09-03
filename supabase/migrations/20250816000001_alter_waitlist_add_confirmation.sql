-- Migration: Alter waitlist - add confirmation tracking
-- Description: Adds confirmation_status and confirmation_sent_at to waitlist_entries for webhook-driven email tracking

DO $$
BEGIN
  -- Add confirmation_status column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waitlist_entries' AND column_name = 'confirmation_status'
  ) THEN
    ALTER TABLE waitlist_entries
      ADD COLUMN confirmation_status text DEFAULT 'pending';
  END IF;

  -- Add confirmation_sent_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waitlist_entries' AND column_name = 'confirmation_sent_at'
  ) THEN
    ALTER TABLE waitlist_entries
      ADD COLUMN confirmation_sent_at timestamptz;
  END IF;

  -- Add CHECK constraint if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'waitlist_entries_confirmation_status_check'
  ) THEN
    ALTER TABLE waitlist_entries
      ADD CONSTRAINT waitlist_entries_confirmation_status_check
      CHECK (confirmation_status IN ('pending', 'sent', 'failed'));
  END IF;
END
$$;

-- Optional index to query pending confirmations quickly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_waitlist_entries_confirmation_status'
  ) THEN
    CREATE INDEX idx_waitlist_entries_confirmation_status
      ON waitlist_entries (confirmation_status)
      WHERE confirmation_status IS NOT NULL;
  END IF;
END
$$;

-- Comment
COMMENT ON COLUMN waitlist_entries.confirmation_status IS 'Email confirmation status for waitlist entry';
COMMENT ON COLUMN waitlist_entries.confirmation_sent_at IS 'Timestamp when confirmation email was sent';