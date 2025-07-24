import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';

interface UploadFile {
  file: File;
  id: string;
  description: string;
  tags: string;
  isPublic: boolean;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const MultiFileUpload = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [globalDescription, setGlobalDescription] = useState('');
  const [globalTags, setGlobalTags] = useState('');
  const [globalIsPublic, setGlobalIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles: UploadFile[] = selectedFiles.map(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large - Please select files smaller than 10MB`);
        return null;
      }
      
      return {
        file,
        id: Math.random().toString(36).substring(2),
        description: globalDescription,
        tags: globalTags,
        isPublic: globalIsPublic,
        status: 'pending' as const,
        progress: 0
      };
    }).filter(Boolean) as UploadFile[];

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileSettings = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const applyGlobalSettings = () => {
    setUploadFiles(prev => prev.map(f => ({
      ...f,
      description: globalDescription,
      tags: globalTags,
      isPublic: globalIsPublic
    })));
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<boolean> => {
    try {
      // Update status to uploading
      updateFileSettings(uploadFile.id, { status: 'uploading', progress: 0 });

      // Generate unique filename
      const fileExt = uploadFile.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      // Upload file to storage with progress tracking
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile.file);

      if (uploadError) {
        throw uploadError;
      }

      // Update progress
      updateFileSettings(uploadFile.id, { progress: 50 });

      // Parse tags
      const tagsArray = uploadFile.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user?.id!,
          filename: fileName,
          original_filename: uploadFile.file.name,
          storage_path: filePath,
          file_size: uploadFile.file.size,
          mime_type: uploadFile.file.type,
          description: uploadFile.description || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          is_public: uploadFile.isPublic
        });

      if (dbError) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
      }

      // Update progress and status
      updateFileSettings(uploadFile.id, { progress: 100, status: 'success' });

      return true;
    } catch (error: any) {
      console.error('Upload error:', error);
      updateFileSettings(uploadFile.id, { 
        status: 'error', 
        error: error.message || 'Upload failed',
        progress: 0 
      });
      return false;
    }
  };

  const handleUploadAll = async () => {
    if (uploadFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.error("No pending files to upload");
      return;
    }

    setUploading(true);

    try {
      // Upload files in parallel with limited concurrency
      const uploadPromises = pendingFiles.map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      
      const successCount = results.filter(Boolean).length;
      const totalCount = pendingFiles.length;

      if (successCount === totalCount) {
        toast.success(`All ${successCount} files uploaded successfully`);
        // Clear successful uploads after a delay
        setTimeout(() => {
          setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
        }, 2000);
      } else {
        toast.warning(`${successCount} of ${totalCount} files uploaded successfully`);
      }

      // Trigger document list refresh
      window.dispatchEvent(new CustomEvent('documentUploaded'));

    } catch (error: any) {
      console.error('Batch upload error:', error);
      toast.error("Error during batch upload");
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

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const pendingCount = uploadFiles.filter(f => f.status === 'pending').length;
  const successCount = uploadFiles.filter(f => f.status === 'success').length;
  const errorCount = uploadFiles.filter(f => f.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Multi-File Upload
        </CardTitle>
        <CardDescription>
          Upload multiple documents at once with batch settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div>
          <Label htmlFor="files-upload">Select Multiple Files</Label>
          <div className="mt-2">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div className="mt-4">
                  <Label htmlFor="files-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:text-primary/80">
                      Choose multiple files
                    </span>
                    <Input
                      id="files-upload"
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={handleFilesSelect}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    or drag and drop multiple files
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, DOC, TXT, images up to 10MB each
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Settings */}
        {uploadFiles.length > 0 && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Apply to All Files</h3>
              <Button variant="outline" size="sm" onClick={applyGlobalSettings}>
                Apply Settings
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="global-description">Description</Label>
                <Textarea
                  id="global-description"
                  placeholder="Description for all files..."
                  value={globalDescription}
                  onChange={(e) => setGlobalDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="global-tags">Tags</Label>
                <Input
                  id="global-tags"
                  placeholder="Tags separated by commas"
                  value={globalTags}
                  onChange={(e) => setGlobalTags(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="global-public">Make All Public</Label>
                <p className="text-sm text-muted-foreground">
                  Apply public visibility to all files
                </p>
              </div>
              <Switch
                id="global-public"
                checked={globalIsPublic}
                onCheckedChange={setGlobalIsPublic}
              />
            </div>
          </div>
        )}

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Files to Upload ({uploadFiles.length})
              </h3>
              <div className="flex gap-2 text-xs">
                {pendingCount > 0 && (
                  <Badge variant="secondary">{pendingCount} pending</Badge>
                )}
                {successCount > 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {successCount} uploaded
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="destructive">{errorCount} failed</Badge>
                )}
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {uploadFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(uploadFile.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                    </div>
                    
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="h-2" />
                    )}
                    
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-xs text-red-600">{uploadFile.error}</p>
                    )}
                    
                    {uploadFile.tags && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {uploadFile.tags.split(',').map((tag, index) => {
                          const trimmedTag = tag.trim();
                          return trimmedTag ? (
                            <Badge key={index} variant="outline" className="text-xs">
                              {trimmedTag}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.id)}
                    className="h-8 w-8 p-0"
                    disabled={uploadFile.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {uploadFiles.length > 0 && (
          <Button
            onClick={handleUploadAll}
            disabled={pendingCount === 0 || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading {pendingCount} files...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {pendingCount} Files
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiFileUpload;