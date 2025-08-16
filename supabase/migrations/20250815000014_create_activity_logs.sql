-- Migration: Create Activity Logs Table (Partitioned)
-- Description: User activity tracking with automatic partitioning

-- Main partitioned table
CREATE TABLE activity_logs (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
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
    part_name := 'activity_logs_' || to_char(start_date, 'YYYY_MM');

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = part_name) THEN
      EXECUTE format(
        'CREATE TABLE %I PARTITION OF activity_logs FOR VALUES FROM (%L) TO (%L)',
        part_name, start_date, end_date
      );
    END IF;
  END LOOP;
END $$;

-- Indexes on parent (propagated to partitions)
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_org ON activity_logs(organization_id, created_at DESC);
CREATE INDEX idx_activity_logs_correlation ON activity_logs(correlation_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action, created_at DESC);

-- Auto-create next month's partition helper
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  partition_date date;
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  partition_date := date_trunc('month', CURRENT_DATE + interval '1 month')::date;
  partition_name := 'activity_logs_' || to_char(partition_date, 'YYYY_MM');
  start_date := partition_date;
  end_date := (partition_date + interval '1 month')::date;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF activity_logs FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE activity_logs IS 'Partitioned user activity audit trail';
COMMENT ON FUNCTION create_monthly_partition IS 'Creates next month partition for activity_logs';