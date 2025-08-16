-- Migration: Create Jobs Queue Table
-- Description: Async job processing and orchestration

CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('analyze_report', 'generate_pdf', 'send_email', 'import_guidelines', 'cleanup')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  priority integer DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}',
  result jsonb,
  error_message text,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  last_attempt_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  scheduled_for timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  idempotency_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(idempotency_key),
  CHECK (attempts <= max_attempts)
);

-- Indexes
-- Avoid non-IMMUTABLE functions like now() in partial index predicates.
-- This index supports the worker query with a WHERE on status and a range on scheduled_for.
CREATE INDEX idx_jobs_ready ON jobs (scheduled_for, priority DESC)
  WHERE status IN ('pending', 'failed');
CREATE INDEX idx_jobs_correlation ON jobs(correlation_id);
CREATE INDEX idx_jobs_org ON jobs(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_jobs_kind_status ON jobs(kind, status);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- Job claim function for workers
CREATE OR REPLACE FUNCTION claim_next_job(worker_id text)
RETURNS jobs AS $$
DECLARE
  next_job jobs;
BEGIN
  SELECT * INTO next_job
  FROM jobs
  WHERE status IN ('pending', 'failed')
    AND scheduled_for <= now()
    AND attempts < max_attempts
  ORDER BY priority DESC, scheduled_for
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF next_job.id IS NOT NULL THEN
    UPDATE jobs 
    SET status = 'running',
        started_at = now(),
        attempts = attempts + 1,
        last_attempt_at = now(),
        updated_at = now()
    WHERE id = next_job.id;
  END IF;
  
  RETURN next_job;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE jobs IS 'Async job queue for background processing';
COMMENT ON COLUMN jobs.correlation_id IS 'For distributed tracing';
COMMENT ON COLUMN jobs.idempotency_key IS 'Prevents duplicate job creation';