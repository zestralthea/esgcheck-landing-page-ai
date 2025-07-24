import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Calendar, Target, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const reportTypes = [
  { value: 'annual', label: 'Annual Report' },
  { value: 'quarterly', label: 'Quarterly Report' },
  { value: 'sustainability', label: 'Sustainability Report' },
  { value: 'impact', label: 'Impact Report' },
  { value: 'custom', label: 'Custom Report' },
];

const griStandards = [
  'GRI 101: Foundation',
  'GRI 102: General Disclosures',
  'GRI 103: Management Approach',
  'GRI 201: Economic Performance',
  'GRI 301: Materials',
  'GRI 302: Energy',
  'GRI 303: Water',
  'GRI 305: Emissions',
  'GRI 401: Employment',
  'GRI 403: Occupational Health and Safety',
  'GRI 405: Diversity and Equal Opportunity',
];

export function ESGUploadPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [selectedGRIStandards, setSelectedGRIStandards] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const validateFile = (selectedFile: File): boolean => {
    // File size validation (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      });
      return false;
    }

    // File type validation - allow common document formats
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, Word, Excel, CSV, or text files only.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const logESGAccess = async (documentId: string, success: boolean, errorMessage?: string) => {
    try {
      await supabase.rpc('log_document_access', {
        doc_id: documentId,
        access_type_param: success ? 'esg_upload' : 'esg_upload_failed',
        success_param: success,
        error_msg: errorMessage || null
      });
    } catch (error) {
      console.error('Failed to log ESG access:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      if (!reportTitle) {
        setReportTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const toggleGRIStandard = (standard: string) => {
    setSelectedGRIStandards(prev => 
      prev.includes(standard) 
        ? prev.filter(s => s !== standard)
        : [...prev, standard]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !reportTitle || !reportType || !periodStart || !periodEnd) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file",
        variant: "destructive",
      });
      return;
    }

    // Re-validate file before upload
    if (!validateFile(file)) {
      return;
    }

    setUploading(true);
    let documentId: string | null = null;
    
    try {
      // Upload file to documents bucket with enhanced security
      const fileExt = file.name.split('.').pop();
      const fileName = `esg-report-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/esg-reports/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Insert document record with enhanced security
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          filename: fileName,
          original_filename: file.name,
          storage_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          description: `ESG Report: ${reportTitle}${description ? ` - ${description}` : ''}`,
          tags: ['esg-report', reportType, ...selectedGRIStandards],
          is_public: false,
        })
        .select()
        .single();

      if (documentError) throw documentError;
      documentId = documentData.id;

      // Create ESG report record
      const { error: reportError } = await supabase
        .from('esg_reports')
        .insert({
          user_id: user.id,
          document_id: documentData.id,
          report_title: reportTitle,
          report_type: reportType,
          gri_standards: selectedGRIStandards,
          reporting_period_start: periodStart,
          reporting_period_end: periodEnd,
          status: 'processing',
        });

      if (reportError) throw reportError;

      // Log successful upload
      await logESGAccess(documentData.id, true);

      toast({
        title: "ESG Report uploaded successfully",
        description: "Your report is being processed for ESG analysis",
      });

      // Reset form
      setFile(null);
      setReportTitle('');
      setReportType('');
      setPeriodStart('');
      setPeriodEnd('');
      setSelectedGRIStandards([]);
      setDescription('');
      
      // Trigger refresh event for audit log
      window.dispatchEvent(new CustomEvent('esgReportUploaded'));
      
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Log failed upload if we have a document ID
      if (documentId) {
        await logESGAccess(documentId, false, error.message);
      }
      
      // Enhanced error handling
      let errorMessage = 'There was an error uploading your report. Please try again.';
      if (error.message?.includes('storage')) {
        errorMessage = 'Storage error: Please check file permissions and try again';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Authentication error: Please log in and try again';
      } else if (error.message?.includes('policy')) {
        errorMessage = 'Permission denied: Please contact support';
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Secure ESG Report Upload
        </CardTitle>
        <CardDescription>
          Upload your ESG report with enhanced security and compliance tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Report Document (Secure Upload) *
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="file" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    {file ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {file.name}
                      </div>
                    ) : (
                      "Click to select document file"
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supported: PDF, Word, Excel, CSV, Text (Max 50MB)
                  </div>
                </div>
              </Label>
            </div>
          </div>

          {/* Report Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g., 2023 Annual Sustainability Report"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Report Type *</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reporting Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">
                <Calendar className="h-4 w-4 inline mr-1" />
                Period Start *
              </Label>
              <Input
                id="start-date"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">
                <Calendar className="h-4 w-4 inline mr-1" />
                Period End *
              </Label>
              <Input
                id="end-date"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          {/* GRI Standards */}
          <div className="space-y-2">
            <Label>
              <Target className="h-4 w-4 inline mr-1" />
              GRI Standards (optional)
            </Label>
            <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {griStandards.map((standard) => (
                  <div
                    key={standard}
                    className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-muted/50 rounded"
                    onClick={() => toggleGRIStandard(standard)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGRIStandards.includes(standard)}
                      onChange={() => toggleGRIStandard(standard)}
                      className="rounded border-muted-foreground"
                    />
                    <span className="text-sm">{standard}</span>
                  </div>
                ))}
              </div>
            </div>
            {selectedGRIStandards.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedGRIStandards.map((standard) => (
                  <Badge key={standard} variant="secondary" className="text-xs">
                    {standard}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional Notes</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional context or specific areas of focus for analysis..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload & Analyze Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}