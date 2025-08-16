-- Migration: Create System Settings Table
-- Description: Application configuration storage

CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_public ON system_settings(is_public) WHERE is_public = true;

-- Initial settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
  ('maintenance_mode', 'false', 'Enable maintenance mode', false),
  ('max_file_size_mb', '50', 'Maximum file upload size in MB', true),
  ('allowed_file_types', '["pdf", "docx", "doc", "txt"]', 'Allowed file types for upload', true),
  ('analysis_timeout_seconds', '300', 'Timeout for analysis jobs', false),
  ('rate_limit_requests_per_minute', '60', 'API rate limit per user', false);

-- Comments
COMMENT ON TABLE system_settings IS 'System-wide configuration settings';