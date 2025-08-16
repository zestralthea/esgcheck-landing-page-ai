-- Migration: Create ESG Frameworks Table
-- Description: ESG reporting frameworks and standards

CREATE TABLE esg_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  version text,
  description text,
  official_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_frameworks_code ON esg_frameworks(code) WHERE is_active = true;
CREATE INDEX idx_frameworks_active ON esg_frameworks(is_active);

-- Initial data
INSERT INTO esg_frameworks (code, name, version, description, official_url) VALUES
  ('GRI', 'Global Reporting Initiative', '2021', 'The global standards for sustainability reporting', 'https://www.globalreporting.org/'),
  ('SASB', 'Sustainability Accounting Standards Board', '2023', 'Industry-specific standards for material ESG factors', 'https://www.sasb.org/'),
  ('TCFD', 'Task Force on Climate-related Financial Disclosures', '2022', 'Framework for climate-related financial risk disclosures', 'https://www.fsb-tcfd.org/'),
  ('CDP', 'Carbon Disclosure Project', '2023', 'Global environmental disclosure system', 'https://www.cdp.net/'),
  ('IIRC', 'International Integrated Reporting Council', '2021', 'Framework for integrated reporting', 'https://www.integratedreporting.org/');

-- Comments
COMMENT ON TABLE esg_frameworks IS 'ESG reporting frameworks and standards';