import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, File, X } from 'lucide-react';

const DocumentUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File too large - Please select a file smaller than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Parse tags
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user?.id!,
          filename: fileName,
          original_filename: file.name,
          storage_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          description: description || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          is_public: isPublic
        });

      if (dbError) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
      }

      // Log the upload
      await supabase.rpc('log_document_access', {
        doc_id: null, // We don't have the ID yet, this is for upload
        access_type_param: 'upload',
        success_param: true
      });

      toast.success(`${file.name} has been uploaded successfully`);

      // Reset form
      setFile(null);
      setDescription('');
      setTags('');
      setIsPublic(false);

      // Trigger a refresh of the document list (you might want to implement this with a context or callback)
      window.dispatchEvent(new CustomEvent('documentUploaded'));

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload and manage your documents securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selection */}
        <div>
          <Label htmlFor="file-upload">Select File</Label>
          <div className="mt-2">
            {!file ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary hover:text-primary/80">
                        Choose a file
                      </span>
                      <Input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      />
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      or drag and drop
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, DOC, TXT, images up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Enter a description for this document..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags">Tags (Optional)</Label>
          <Input
            id="tags"
            placeholder="Enter tags separated by commas"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-2"
          />
          {tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.split(',').map((tag, index) => {
                const trimmedTag = tag.trim();
                return trimmedTag ? (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {trimmedTag}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Public/Private Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="public-toggle">Make Public</Label>
            <p className="text-sm text-muted-foreground">
              Allow others to view this document
            </p>
          </div>
          <Switch
            id="public-toggle"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;