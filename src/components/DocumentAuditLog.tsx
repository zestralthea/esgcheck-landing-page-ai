import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  ExternalLink,
  FileDown,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface AccessLog {
  id: string;
  document_id: string;
  access_type: string;
  success: boolean;
  accessed_at: string;
  error_message: string | null;
  documents: {
    original_filename: string;
  } | null;
}

const DocumentAuditLog = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('document_access_logs')
        .select(`
          *,
          documents (
            original_filename
          )
        `)
        .order('accessed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast.error(error.message || "Error loading audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();

    // Set up real-time subscription for new logs
    const channel = supabase
      .channel('audit-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'document_access_logs'
        },
        () => {
          fetchAuditLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getAccessIcon = (accessType: string) => {
    switch (accessType) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'upload':
        return <Upload className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'signed_url_view':
        return <ExternalLink className="h-4 w-4" />;
      case 'signed_url_download':
        return <FileDown className="h-4 w-4" />;
      case 'view_failed':
      case 'download_failed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getAccessTypeColor = (accessType: string) => {
    switch (accessType) {
      case 'view':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'download':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'upload':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'signed_url_view':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
      case 'signed_url_download':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'view_failed':
      case 'download_failed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Log
        </CardTitle>
        <CardDescription>
          Recent document access and activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
            <p className="text-muted-foreground">
              Document access will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Icon and Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`p-2 rounded-full ${getAccessTypeColor(log.access_type)}`}>
                    {getAccessIcon(log.access_type)}
                  </div>
                  {log.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getAccessTypeColor(log.access_type)}`}
                    >
                      {log.access_type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(log.accessed_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium mb-1">
                    {log.documents?.original_filename || 'Unknown Document'}
                  </p>
                  
                  {!log.success && log.error_message && (
                    <p className="text-xs text-red-600 truncate">
                      Error: {log.error_message}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {formatDate(log.accessed_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentAuditLog;