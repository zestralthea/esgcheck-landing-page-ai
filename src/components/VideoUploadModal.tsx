import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Video, X } from "lucide-react";
import { useHeroVideos } from "@/hooks/useHeroVideos";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoUploadModal({ isOpen, onClose }: VideoUploadModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(false);
  
  const { uploadVideo, createVideo, loading } = useHeroVideos();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please select a valid video file (MP4, WebM, OGG, or MOV)');
        return;
      }
      
      // Check file size (100MB limit)
      if (selectedFile.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title.trim()) {
      alert('Please provide a title and select a video file');
      return;
    }

    try {
      // Upload the video file
      const videoUrl = await uploadVideo(file);
      if (!videoUrl) return;

      // Create the video record
      await createVideo({
        title: title.trim(),
        description: description.trim() || undefined,
        video_url: videoUrl,
        is_active: isActive,
      });

      // Reset form and close modal
      setTitle('');
      setDescription('');
      setFile(null);
      setIsActive(false);
      onClose();
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Upload Hero Video
          </DialogTitle>
          <DialogDescription>
            Upload a new video for the hero section. Supported formats: MP4, WebM, OGG, MOV (max 100MB)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-file">Video File *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-success">
                    <Video className="h-6 w-6" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Size: {formatFileSize(file.size)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div>
                    <Label
                      htmlFor="video-file"
                      className="cursor-pointer text-primary hover:text-primary/80"
                    >
                      Click to upload video
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      MP4, WebM, OGG, or MOV (max 100MB)
                    </p>
                  </div>
                </div>
              )}
              <Input
                id="video-file"
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="is-active" className="text-sm">
              Set as active video (will replace current active video)
            </Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file || !title.trim()}>
              {loading ? "Uploading..." : "Upload Video"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}