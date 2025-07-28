
-- Create a public storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos', 
  'videos', 
  true, 
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
);

-- Create storage policies for the videos bucket
CREATE POLICY "Anyone can view videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Anyone can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Anyone can update videos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'videos');

CREATE POLICY "Anyone can delete videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'videos');

-- Create a table to store video metadata
CREATE TABLE public.hero_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hero_videos table
ALTER TABLE public.hero_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for hero_videos (public read, authenticated write)
CREATE POLICY "Anyone can view hero videos" ON public.hero_videos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage hero videos" ON public.hero_videos
  FOR ALL USING (auth.role() = 'authenticated');
