import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Globe, 
  Lock,
  Calendar,
  FileText
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Document {
  id: string;
  filename: string;
  original_filename: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  description: string | null;
  tags: string[] | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const DocumentList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error(error.message || "Error loading documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    // Listen for document uploads
    const handleDocumentUploaded = () => {
      fetchDocuments();
    };

    window.addEventListener('documentUploaded', handleDocumentUploaded);
    return () => window.removeEventListener('documentUploaded', handleDocumentUploaded);
  }, []);

  const handleView = async (document: Document) => {
    try {
      // Log the view access
      await supabase.rpc('log_document_access', {
        doc_id: document.id,
        access_type_param: 'view',
        success_param: true
      });

      // Get signed URL for viewing
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.storage_path, 3600); // 1 hour expiry

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Error viewing document:', error);
      
      // Log failed access
      await supabase.rpc('log_document_access', {
        doc_id: document.id,
        access_type_param: 'view',
        success_param: false,
        error_msg: error.message
      });

      toast.error(error.message || "Error viewing document");
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      // Log the download access
      await supabase.rpc('log_document_access', {
        doc_id: document.id,
        access_type_param: 'download',
        success_param: true
      });

      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.storage_path, 300); // 5 minutes expiry

      if (error) throw error;

      if (data?.signedUrl) {
        const link = window.document.createElement('a');
        link.href = data.signedUrl;
        link.download = document.original_filename;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      }
    } catch (error: any) {
      console.error('Error downloading document:', error);
      
      // Log failed access
      await supabase.rpc('log_document_access', {
        doc_id: document.id,
        access_type_param: 'download',
        success_param: false,
        error_msg: error.message
      });

      toast.error(error.message || "Error downloading document");
    }
  };

  const confirmDelete = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([documentToDelete.storage_path]);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (dbError) throw dbError;

      // Log the deletion
      await supabase.rpc('log_document_access', {
        doc_id: documentToDelete.id,
        access_type_param: 'delete',
        success_param: true
      });

      toast.success(`${documentToDelete.original_filename} has been deleted`);

      // Refresh the list
      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || "Error deleting document");
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Documents
          </CardTitle>
          <CardDescription>
            Manage and access your uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Document List */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <File className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    <File className="h-8 w-8 text-primary" />
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {document.original_filename}
                      </p>
                      {document.is_public ? (
                        <Globe className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    {document.description && (
                      <p className="text-xs text-muted-foreground mb-1 truncate">
                        {document.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(document.created_at)}
                      <span>•</span>
                      {formatFileSize(document.file_size)}
                    </div>
                    
                    {document.tags && document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {document.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(document)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(document)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDelete(document)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.original_filename}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentList;