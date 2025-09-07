-- Fix critical security vulnerabilities in RLS policies

-- 1. Fix waitlist_entries table - should only be accessible to admins
DROP POLICY IF EXISTS "Anyone can read waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Service role can insert waitlist entries" ON public.waitlist_entries;

-- Create proper RLS policies for waitlist_entries
CREATE POLICY "Only admins can read waitlist entries" ON public.waitlist_entries
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Only admins can insert waitlist entries" ON public.waitlist_entries
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "System can insert waitlist entries" ON public.waitlist_entries
  FOR INSERT WITH CHECK (true);

-- 2. Fix profiles table - should only be accessible to profile owner and org members
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Organization members can view each other's profiles" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT user_id FROM organization_members om1
      WHERE om1.organization_id IN (
        SELECT om2.organization_id FROM organization_members om2
        WHERE om2.user_id = auth.uid() AND om2.deleted_at IS NULL
      )
      AND om1.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- 3. Fix organizations table - remove public access for private orgs
DROP POLICY IF EXISTS "Public organizations are viewable by everyone" ON public.organizations;

-- Create proper policy for public organizations only
CREATE POLICY "Public organizations are viewable by everyone" ON public.organizations
  FOR SELECT USING (is_public = true AND deleted_at IS NULL);

-- 4. Fix system_settings table - restrict to admins only
DROP POLICY IF EXISTS "Public system settings are viewable by everyone" ON public.system_settings;

CREATE POLICY "Only admins can read system settings" ON public.system_settings
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Only admins can update system settings" ON public.system_settings
  FOR UPDATE USING (public.is_admin());

-- 5. Enable RLS on any tables that might not have it enabled
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;