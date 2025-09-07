import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  CheckCircle, 
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface ESGAccessLog {
  id: string;
  document_id: string;
  access_type: string;
  success: boolean;
  accessed_at: string;
  error_message: string | null;
  documents: {
    filename: string;
  } | null;
}

const ESGReportAuditLog = () => {
  const [logs, setLogs] = useState<ESGAccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('document_access_logs')
        .select(`
          *,
          documents (
            filename,
            file_name
          )
        `)
        .eq('access_type', 'esg_upload')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Map the data to include accessed_at field for backward compatibility
      const logsWithAccessedAt = (data || []).map(log => ({
        ...log,
        accessed_at: log.accessed_at || log.created_at,
        documents: {
          filename: log.documents?.filename || log.documents?.file_name || 'Unknown File'
        }
      }));
      
      setLogs(logsWithAccessedAt as any);
    } catch (error: any) {
      console.error('Error fetching ESG audit logs:', error);
      toast.error(error.message || "Error loading ESG audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();

    // Set up real-time subscription for new ESG logs
    const channel = supabase
      .channel('esg-audit-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'document_access_logs',
          filter: 'access_type=eq.esg_upload'
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
      case 'esg_upload':
        return <Upload className="h-4 w-4" />;
      case 'esg_upload_failed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            ESG Upload Activity
          </CardTitle>
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
          <Shield className="h-5 w-5" />
          ESG Upload Activity
        </CardTitle>
        <CardDescription>
          Recent ESG report upload activity and security monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No ESG uploads yet</h3>
            <p className="text-muted-foreground">
              ESG report upload activity will appear here
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
                  <div className={`p-2 rounded-full ${
                    log.success 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
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
                      className={`text-xs ${
                        log.success 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      ESG UPLOAD
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(log.accessed_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium mb-1">
                    {log.documents?.filename || 'ESG Report Upload'}
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

export default ESGReportAuditLog;