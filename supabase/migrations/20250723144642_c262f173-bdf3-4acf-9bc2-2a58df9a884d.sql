-- Enable the dashboard feature flag
UPDATE public.feature_flags 
SET is_enabled = true 
WHERE flag_name = 'dashboard_enabled';