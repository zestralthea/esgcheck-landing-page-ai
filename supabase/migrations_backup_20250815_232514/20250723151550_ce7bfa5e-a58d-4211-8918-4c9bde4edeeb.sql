-- Enable realtime for feature_flags table
ALTER TABLE public.feature_flags REPLICA IDENTITY FULL;

-- Add feature_flags table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_flags;