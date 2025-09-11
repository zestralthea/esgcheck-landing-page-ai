import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Download,
  Eye,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ESGReport {
  id: string;
  report_title: string;
  report_type: string;
  status: string;
  created_at: string;
  analysis?: {
    id: string;
    pdf_document_id: string;
    created_at: string;
  };
}

export function PDFReportViewer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<ESGReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchCompletedReports();
    }
  }, [user]);

  useEffect(() => {
    if (selectedReportId) {
      loadSelectedReport();
    } else {
      setPdfUrl('');
    }
  }, [selectedReportId]);

  const fetchCompletedReports = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('esg_reports')
        .select(`
          id,
          report_title,
          report_type,
          status,
          created_at,
          esg_report_analyses (
            id,
            pdf_document_id,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('esg_report_analyses', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedReports = data?.map((report: any) => ({
        id: report.id,
        report_title: report.report_title || 'Untitled Report',
        report_type: report.report_type || 'sustainability',
        status: report.status,
        created_at: report.created_at,
        analysis: report.esg_report_analyses?.[0] ? {
          id: report.esg_report_analyses[0].id,
          pdf_document_id: report.esg_report_analyses[0].pdf_document_id,
          created_at: report.esg_report_analyses[0].created_at
        } : undefined
      })).filter(report => report.analysis) as ESGReport[];

      setReports(transformedReports || []);

      // Auto-select the most recent report
      if (transformedReports && transformedReports.length > 0) {
        setSelectedReportId(transformedReports[0].id);
      }
    } catch (error) {
      console.error('Error fetching completed reports:', error);
      toast({
        title: "Error loading reports",
        description: "Failed to load your completed reports.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedReport = async () => {
    if (!selectedReportId) return;

    const selectedReport = reports.find(r => r.id === selectedReportId);
    if (!selectedReport?.analysis?.pdf_document_id) return;

    try {
      setLoadingPDF(true);

      // Construct PDFMonkey download URL
      const pdfDownloadUrl = `https://pdfmonkey.io/api/v1/documents/${selectedReport.analysis.pdf_document_id}/download`;
      setPdfUrl(pdfDownloadUrl);

    } catch (error) {
      console.error('Error loading PDF:', error);
      toast({
        title: "Error loading PDF",
        description: "Failed to load the analysis PDF.",
        variant: "destructive",
      });
    } finally {
      setLoadingPDF(false);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      toast({
        title: "Download started",
        description: "Your ESG analysis PDF is being downloaded.",
      });
    }
  };

  const refreshReports = () => {
    setLoading(true);
    fetchCompletedReports();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ESG Analysis Reports
          </CardTitle>
          <CardDescription>View your completed ESG analysis reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading reports...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ESG Analysis Reports
          </CardTitle>
          <CardDescription>View your completed ESG analysis reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No completed ESG analysis reports found.
            </p>
            <p className="text-sm text-muted-foreground">
              Upload and process an ESG report to see your analysis here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedReport = reports.find(r => r.id === selectedReportId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          ESG Analysis Reports
        </CardTitle>
        <CardDescription>View your completed ESG analysis reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Report Selector */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedReportId} onValueChange={setSelectedReportId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report to view" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      <div className="flex items-center gap-2">
                        <span>{report.report_title}</span>
                        <Badge variant="outline" className="text-xs">
                          {report.report_type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshReports}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Report Info */}
          {selectedReport && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium">{selectedReport.report_title}</h3>
                <p className="text-sm text-muted-foreground">
                  Completed on {new Date(selectedReport.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedReport.report_type}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPDF}
                  disabled={!pdfUrl || loadingPDF}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(pdfUrl, '_blank')}
                  disabled={!pdfUrl || loadingPDF}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {selectedReportId && (
            <div className="border rounded-lg overflow-hidden">
              {loadingPDF ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading PDF...</span>
                </div>
              ) : pdfUrl ? (
                <div className="bg-gray-100 p-4">
                  <div className="bg-white rounded shadow-sm">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">ESG Analysis Report</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-96 border rounded"
                        title="ESG Analysis Report"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">No PDF available</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
