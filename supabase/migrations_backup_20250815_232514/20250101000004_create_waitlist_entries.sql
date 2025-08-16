-- Migration: Create Waitlist Entries Table
-- Description: Track waitlist signups and conversions

CREATE TABLE waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text,
  company_size text CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  use_case text,
  referral_source text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'converted', 'rejected')),
  approved_at timestamptz,
  converted_at timestamptz,
  converted_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_waitlist_email ON waitlist_entries(email);
CREATE INDEX idx_waitlist_status ON waitlist_entries(status) WHERE status = 'pending';
CREATE INDEX idx_waitlist_created ON waitlist_entries(created_at DESC);

-- Comments
COMMENT ON TABLE waitlist_entries IS 'Waitlist signups and conversion tracking';
COMMENT ON COLUMN waitlist_entries.status IS 'Waitlist entry status: pending, approved, converted, rejected';