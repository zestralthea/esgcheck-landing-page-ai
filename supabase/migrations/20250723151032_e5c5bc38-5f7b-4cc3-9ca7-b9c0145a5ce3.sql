-- Add the auth_public_access feature flag
INSERT INTO public.feature_flags (flag_name, is_enabled, description) VALUES
('auth_public_access', false, 'Controls whether authentication (sign in/sign up) is publicly accessible');