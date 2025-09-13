-- Populate essential feature flags for ESGCheck application
INSERT INTO public.feature_flags (flag_name, is_enabled, description) VALUES
('auth_public_access', true, 'Controls whether authentication (sign in/sign up) is publicly accessible'),
('dashboard_enabled', true, 'Controls access to the main dashboard'),
('dashboard_beta_access', true, 'Controls beta access to dashboard features'),
('esg_upload_enabled', true, 'Controls whether users can upload ESG documents'),
('esg_analysis_enabled', true, 'Controls whether users can perform ESG analysis'),
('advanced_analytics', true, 'Controls access to advanced analytics features')
ON CONFLICT (flag_name) DO UPDATE SET
is_enabled = EXCLUDED.is_enabled,
description = EXCLUDED.description,
updated_at = now();
