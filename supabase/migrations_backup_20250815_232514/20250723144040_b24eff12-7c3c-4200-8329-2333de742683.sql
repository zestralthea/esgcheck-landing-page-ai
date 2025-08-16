-- Create security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add UPDATE policy for feature_flags table (admins only)
CREATE POLICY "Admins can update feature flags"
ON public.feature_flags
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Add admin policies for profiles table to allow admins to update any user's dashboard_access
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can update any user's dashboard access"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin() OR auth.uid() = id)
WITH CHECK (public.is_admin() OR auth.uid() = id);