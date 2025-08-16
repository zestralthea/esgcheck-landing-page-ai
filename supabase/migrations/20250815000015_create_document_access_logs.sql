-- Migration: Create Document Access Logs Table (Partitioned)
-- Description: Document access audit trail with automatic partitioning

-- Main partitioned table
CREATE TABLE document_access_logs (
  id uuid DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  access_type text NOT NULL CHECK (access_type IN ('view', 'download', 'upload', 'delete', 'share')),
  success boolean DEFAULT true,
  error_message text,
  ip_address inet,
  correlation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

-- Create initial partitions (3 months rolling to start)
DO $$
DECLARE
  month_start date := date_trunc('month', CURRENT_DATE)::date;
  i int;
  part_name text;
  start_date date;
  end_date date;
BEGIN
  FOR i IN 0..2 LOOP
    start_date := (month_start + (i || ' month')::interval)::date;
    end_date := (month_start + ((i + 1) || ' month')::interval)::date;
    part_name := 'document_access_logs_' || to_char(start_date, 'YYYY_MM');

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = part_name) THEN
      EXECUTE format(
        'CREATE TABLE %I PARTITION OF document_access_logs FOR VALUES FROM (%L) TO (%L)',
        part_name, start_date, end_date
      );
    END IF;
  END LOOP;
END $$;

-- Indexes on parent (propagated to partitions)
CREATE INDEX idx_doc_access_document ON document_access_logs(document_id, created_at DESC);
CREATE INDEX idx_doc_access_user ON document_access_logs(user_id, created_at DESC);
CREATE INDEX idx_doc_access_type ON document_access_logs(access_type, created_at DESC);
CREATE INDEX idx_doc_access_correlation ON document_access_logs(correlation_id);

-- Auto-create next month's partition helper
CREATE OR REPLACE FUNCTION create_document_logs_monthly_partition()
RETURNS void AS $$
DECLARE
  partition_date date;
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  partition_date := date_trunc('month', CURRENT_DATE + interval '1 month')::date;
  partition_name := 'document_access_logs_' || to_char(partition_date, 'YYYY_MM');
  start_date := partition_date;
  end_date := (partition_date + interval '1 month')::date;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF document_access_logs FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE document_access_logs IS 'Partitioned document access audit trail';
COMMENT ON FUNCTION create_document_logs_monthly_partition IS 'Creates next month partition for document_access_logs';