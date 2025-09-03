import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Download, 
  Eye, 
  MoreHorizontal, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ESGReport {
  id: string;
  report_title: string;
  report_type: string;
  status: string;
  reporting_period_start: string;
  reporting_period_end: string;
  gri_standards: string[];
  created_at: string;
  document: {
    filename: string;
    original_filename: string;
    file_size: number;
    storage_path: string;
  };
  analysis?: {
    id: string;
    pdf_document_id: string;
    pdf_download_url?: string;
    created_at: string;
  };
}

const statusConfig = {
  draft: { icon: Edit, label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  processing: { icon: Clock, label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'bg-green-100 text-green-800' },
  failed: { icon: XCircle, label: 'Failed', color: 'bg-red-100 text-red-800' },
};

const reportTypeLabels = {
  annual: 'Annual Report',
  quarterly: 'Quarterly Report',
  sustainability: 'Sustainability Report',
  impact: 'Impact Report',
  custom: 'Custom Report',
};

export function ESGReportsTable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<ESGReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;

    try {
      // First, get the reports with their documents
      const { data, error } = await supabase
        .from('esg_reports')
        .select(`
          id,
          title,
          report_title,
          report_type,
          status,
          reporting_period_start,
          reporting_period_end,
          tags,
          created_at,
          documents (
            file_name,
            original_filename,
            file_size,
            storage_path
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Transform the data to match our interface
      const transformedData = data.map(report => ({
        ...report,
        report_title: report.report_title || report.title,
        gri_standards: report.tags || [],
        document: Array.isArray(report.documents) ? report.documents[0] : report.documents
      })) as ESGReport[];
      
      // Now, fetch the analysis data for each report using esg_analyses table
      const reportIds = transformedData.map(report => report.id);
      const { data: analysisData, error: analysisError } = await supabase
        .from('esg_analyses')
        .select('id, report_id, full_analysis, created_at')
        .in('report_id', reportIds);
      
      if (analysisError) {
        console.error('Error fetching analysis data:', analysisError);
      } else if (analysisData) {
        // Create a map of report_id to analysis for quick lookup
        const analysisMap = analysisData.reduce((acc, analysis) => {
          acc[analysis.report_id] = {
            id: analysis.id,
            pdf_document_id: analysis.id, // Use analysis id as pdf document id
            created_at: analysis.created_at
          };
          return acc;
        }, {} as Record<string, any>);
        
        // Add analysis data to each report
        transformedData.forEach(report => {
          if (analysisMap[report.id]) {
            report.analysis = analysisMap[report.id];
          }
        });
      }
      
      setReports(transformedData);
    } catch (error) {
      console.error('Error fetching ESG reports:', error);
      toast({
        title: "Error loading reports",
        description: "Failed to load your ESG reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Download the AI analysis PDF from PDFMonkey
  const downloadAnalysisPDF = async (report: ESGReport) => {
    if (!report.analysis?.pdf_document_id) {
      toast({
        title: "Analysis not available",
        description: "The AI analysis for this report is not yet available.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // First, check if we need to get the download URL from PDFMonkey
      if (!report.analysis.pdf_download_url) {
        // Call our Supabase function to get the PDF download URL
        const { data, error } = await supabase.functions.invoke('get-pdf-download-url', {
          body: { 
            pdf_document_id: report.analysis.pdf_document_id
          }
        });
        
        if (error) throw error;
        
        if (!data?.download_url) {
          throw new Error("Failed to get PDF download URL");
        }
        
        // Update our report with the download URL using jobs table instead
        await supabase
          .from('jobs')
          .insert({
            kind: 'pdf_download_url_update',
            payload: { analysis_id: report.analysis.id, download_url: data.download_url }
          });
        
        // Update local state
        report.analysis.pdf_download_url = data.download_url;
      }
      
      // Now use the download URL to fetch the PDF
      window.open(report.analysis.pdf_download_url, '_blank');
      
      toast({
        title: "Analysis PDF",
        description: "Your ESG analysis PDF is being downloaded.",
      });
    } catch (error) {
      console.error('Error downloading analysis PDF:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the analysis PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (report: ESGReport) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(report.document.storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.document.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Downloading ${report.document.original_filename}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
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
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Reports History</CardTitle>
          <CardDescription>Loading your ESG reports...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Reports History</CardTitle>
          <CardDescription>No ESG reports found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Your uploaded ESG reports will appear here once processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          ESG Reports History
        </CardTitle>
        <CardDescription>
          Track and manage your sustainability reporting history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GRI Standards</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const statusInfo = statusConfig[report.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo?.icon || Clock;

                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium">{report.report_title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {reportTypeLabels[report.report_type as keyof typeof reportTypeLabels] || report.report_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.reporting_period_start)} - {formatDate(report.reporting_period_end)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
                          {statusInfo?.label || report.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {report.gri_standards?.length > 0 
                          ? `${report.gri_standards.length} standards`
                          : 'None specified'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{report.document?.original_filename}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(report.document?.file_size || 0)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(report.created_at)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => downloadReport(report)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                          </DropdownMenuItem>
                          {report.status === 'completed' && (
                            <>
                              <DropdownMenuItem onClick={() => downloadAnalysisPDF(report)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Download Analysis PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Analysis
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}