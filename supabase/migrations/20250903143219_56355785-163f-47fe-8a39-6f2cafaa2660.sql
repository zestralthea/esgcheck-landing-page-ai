-- Remove the auth_public_access feature flag entry
-- This makes auth page always accessible without feature flag control

DELETE FROM public.feature_flags
WHERE flag_name = 'auth_public_access';
