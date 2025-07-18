import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HeroVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useHeroVideos() {
  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<HeroVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all videos
  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVideos(data || []);
      
      // Set active video
      const active = data?.find(video => video.is_active) || null;
      setActiveVideo(active);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch videos. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Upload video file to storage
  const uploadVideo = async (file: File): Promise<string | null> => {
    try {
      setLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `hero-videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create new video record
  const createVideo = async (videoData: {
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    is_active?: boolean;
  }) => {
    try {
      setLoading(true);

      // If this video is being set as active, deactivate others first
      if (videoData.is_active) {
        await supabase
          .from('hero_videos')
          .update({ is_active: false })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all existing videos
      }

      const { data, error } = await supabase
        .from('hero_videos')
        .insert([videoData])
        .select()
        .single();

      if (error) throw error;

      await fetchVideos(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });

      return data;
    } catch (error) {
      console.error('Error creating video:', error);
      toast({
        title: "Error",
        description: "Failed to save video. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Set active video
  const setVideoActive = async (videoId: string) => {
    try {
      setLoading(true);

      // Deactivate all videos first
      await supabase
        .from('hero_videos')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Activate the selected video
      const { error } = await supabase
        .from('hero_videos')
        .update({ is_active: true })
        .eq('id', videoId);

      if (error) throw error;

      await fetchVideos(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Active video updated!",
      });
    } catch (error) {
      console.error('Error setting active video:', error);
      toast({
        title: "Error",
        description: "Failed to update active video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete video
  const deleteVideo = async (videoId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('hero_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      await fetchVideos(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Video deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    activeVideo,
    loading,
    uploadVideo,
    createVideo,
    setVideoActive,
    deleteVideo,
    fetchVideos,
  };
}