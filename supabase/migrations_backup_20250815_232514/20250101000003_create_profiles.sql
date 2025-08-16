-- Migration: Create User Profiles Table
-- Description: Extended user information beyond auth.users

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone_number text,
  timezone text DEFAULT 'UTC' CHECK (timezone ~ '^[A-Za-z/_]+$'),
  default_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  preferences jsonb DEFAULT '{}',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_default_org ON profiles(default_organization_id);
CREATE INDEX idx_profiles_created ON profiles(created_at DESC);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (new.id, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Comments
COMMENT ON TABLE profiles IS 'Extended user profile information';
COMMENT ON COLUMN profiles.timezone IS 'IANA timezone identifier';