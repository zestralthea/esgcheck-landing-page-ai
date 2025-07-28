import { useState, useEffect } from 'react';
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
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'error';
    message: string;
    details?: any;
    responseTime?: number;
  }>({
    status: 'idle',
    message: 'Test not yet run'
  });
  
  // Auto-test the edge function when component mounts
  useEffect(() => {
    const testEdgeFunction = async () => {
      console.log('🔄 AUTO-TEST: Automatically testing analyze-esg-report edge function on component mount');
      setTestResult({
        status: 'running',
        message: 'Testing edge function...'
      });
      try {
        const testStartTime = Date.now();
        const { data, error } = await supabase.functions.invoke('analyze-esg-report', {
          body: {
            report_id: 'auto-test-123',
            report_text: 'This is an automatic test report for ESG analysis to verify the edge function is working.',
            framework: 'general'
          }
        });
        const testEndTime = Date.now();
        
        console.log(`⏱️ Auto-test call to analyze-esg-report took ${testEndTime - testStartTime}ms to respond`);
        
        if (error) {
          console.error('❌ Auto-test call failed with error:', error);
          console.error('Error details:', {
            status: error.status,
            message: error.message,
            name: error.name,
            context: error.context
          });
          setTestResult({
            status: 'error',
            message: `Edge function call failed: ${error.message || 'Unknown error'}`,
            details: error,
            responseTime: testEndTime - testStartTime
          });
          toast({
            title: "Auto-Test Failed",
            description: `Edge function call failed: ${error.message || 'Unknown error'}`,
            variant: "destructive",
          });
        } else {
          console.log('✅ Auto-test call succeeded with result:', data);
          setTestResult({
            status: 'success',
            message: 'Edge function was called successfully!',
            details: data,
            responseTime: testEndTime - testStartTime
          });
          toast({
            title: "Auto-Test Successful",
            description: "Edge function was called successfully!",
          });
        }
      } catch (testError: any) {
        console.error('❌ Auto-test call exception:', testError);
        console.error('Detailed test error:', {
          message: testError.message,
          stack: testError.stack,
          name: testError.name,
          cause: testError.cause,
          code: testError.code,
          response: testError.response ? {
            status: testError.response.status,
            statusText: testError.response.statusText,
            headers: testError.response.headers,
            url: testError.response.url
          } : 'No response object'
        });
        toast({
          title: "Auto-Test Failed",
          description: `Exception: ${testError.message || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    };
    
    // Run the test after a short delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      testEdgeFunction();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [toast]);

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

  // Extract text from file for AI analysis
  const extractTextFromFile = async (file: File): Promise<string> => {
    // For text-based files, use FileReader
    if (file.type === 'text/plain' || file.type === 'text/csv') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
    
    // For other files, we'll convert to base64 and use the secure-file-upload
    // function which can handle text extraction on the server side
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Just return a placeholder message that we'll extract text on the server
        resolve(`Text will be extracted from ${file.name} on the server.`);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    
    try {
      // Convert file to base64 for secure upload
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get just the base64 data
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Use secure file upload edge function
      const { data, error } = await supabase.functions.invoke('secure-file-upload', {
        body: {
          file: fileBase64,
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
          reportTitle,
          reportType,
          reportingPeriodStart: periodStart,
          reportingPeriodEnd: periodEnd,
          description,
          griStandards: selectedGRIStandards
        }
      });

      if (error) {
        throw new Error(error.message || 'Upload failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      // Now that the file is uploaded, extract text for analysis
      const reportText = await extractTextFromFile(file);
      
      // Update upload status
      toast({
        title: "ESG Report uploaded successfully",
        description: "Now analyzing your report with AI...",
      });
      
      // Call the analyze-esg-report function to process the report
      try {
        console.log('✅ File uploaded successfully, document ID:', data.document.id);
        console.log('📝 Extracted text length:', reportText.length);
        console.log('🔄 Calling analyze-esg-report with:', {
          report_id: data.document.id,
          report_text_sample: reportText.substring(0, 100) + '...',
          report_text_length: reportText.length,
          framework: selectedGRIStandards.length > 0 ? 'GRI' : 'general'
        });
        
        // Log request being sent
        console.log('📤 Sending request to analyze-esg-report edge function...');
        
        const analyzeStartTime = Date.now();
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-esg-report', {
          body: {
            report_id: data.document.id,
            report_text: reportText,
            framework: selectedGRIStandards.length > 0 ? 'GRI' : 'general'
          }
        });
        const analyzeEndTime = Date.now();
        
        console.log(`⏱️ analyze-esg-report took ${analyzeEndTime - analyzeStartTime}ms to respond`);
        
        if (analysisError) {
          console.error('❌ Analysis error (from response):', analysisError);
          console.error('Error details:', {
            status: analysisError.status,
            message: analysisError.message,
            name: analysisError.name,
            context: analysisError.context
          });
          
          await logESGAccess(data.document.id, false, `Analysis failed: ${analysisError.message}`);
          
          toast({
            title: "Report uploaded",
            description: "Your report was uploaded, but there was an issue with the analysis. Our team will process it manually.",
          });
        } else {
          console.log('✅ Analysis completed successfully:', analysisData);
          await logESGAccess(data.document.id, true);
          
          toast({
            title: "ESG Analysis Complete",
            description: "Your report has been analyzed and is available in the Reports section.",
          });
        }
      } catch (analysisError: any) {
        console.error('❌ Analysis error (from exception):', analysisError);
        console.error('Detailed error information:', {
          message: analysisError.message,
          stack: analysisError.stack,
          name: analysisError.name,
          cause: analysisError.cause,
          code: analysisError.code,
          response: analysisError.response ? {
            status: analysisError.response.status,
            statusText: analysisError.response.statusText,
            headers: analysisError.response.headers,
          } : 'No response object'
        });
        
        // Try to log the error even when exception occurred
        try {
          if (data?.document?.id) {
            await logESGAccess(data.document.id, false, `Exception: ${analysisError.message}`);
          }
        } catch (logError) {
          console.error('Failed to log error:', logError);
        }
        
        toast({
          title: "Report uploaded",
          description: "Your report was uploaded, but there was an issue with the analysis. Our team will process it manually.",
        });
      }

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
      
      // Enhanced error handling with server-side validation feedback
      let errorMessage = 'There was an error uploading your report. Please try again.';
      
      if (error.message?.includes('Validation failed')) {
        errorMessage = 'Validation failed: Please check your inputs and try again';
      } else if (error.message?.includes('Authentication')) {
        errorMessage = 'Authentication error: Please log in and try again';
      } else if (error.message?.includes('Invalid file type')) {
        errorMessage = 'Invalid file type: Only PDF, Word documents, and text files are allowed';
      } else if (error.message?.includes('File size')) {
        errorMessage = 'File too large: Maximum size is 50MB';
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

          <div className="space-y-4">
            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? 'Uploading...' : 'Upload & Analyze Report'}
            </Button>
            
            {/* Test button for direct function invocation */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Troubleshooting Tools</p>
              {/* Test Results Display */}
              {testResult.status !== 'idle' && (
                <div className={`p-3 border rounded-lg mb-3 ${
                  testResult.status === 'running' ? 'bg-blue-50 border-blue-200' :
                  testResult.status === 'success' ? 'bg-green-50 border-green-200' : 
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {testResult.status === 'running' && (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    )}
                    {testResult.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {testResult.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    <span className="font-medium">
                      {testResult.status === 'running' ? 'Testing Edge Function...' :
                       testResult.status === 'success' ? 'Edge Function Test Successful' :
                       'Edge Function Test Failed'}
                    </span>
                  </div>
                  <p className="text-sm mb-1">{testResult.message}</p>
                  {testResult.responseTime && (
                    <p className="text-xs text-muted-foreground">
                      Response time: {testResult.responseTime}ms
                    </p>
                  )}
                  {testResult.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">View Response Details</summary>
                      <pre className="text-xs mt-1 p-2 bg-slate-800 text-white rounded overflow-auto max-h-60">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  <div className="mt-2 text-xs">
                    <details>
                      <summary className="cursor-pointer">Environment & Deployment Info</summary>
                      <div className="mt-1 p-2 bg-slate-800 text-white rounded overflow-auto">
                        <p>Function ID: 77f5fdcb-fb1b-4143-b0e2-576e8b9d7050</p>
                        <p>URL: {supabase.supabaseUrl}/functions/v1/analyze-esg-report</p>
                        <p>API Key: {supabase.supabaseKey ? "✅ Present" : "❌ Missing"}</p>
                        <p>Method: POST</p>
                        <p>Required env vars: OPENAI_API_KEY, PDFMONKEY_API_KEY, PDFMONKEY_TEMPLATE_ID</p>
                      </div>
                    </details>
                  </div>
                </div>
              )}
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={async () => {
                  console.log('🧪 TEST: Directly calling analyze-esg-report edge function...');
                  setTestResult({
                    status: 'running',
                    message: 'Testing analyze-esg-report edge function...'
                  });
                  try {
                    const testStartTime = Date.now();
                    const { data, error } = await supabase.functions.invoke('analyze-esg-report', {
                      body: {
                        report_id: 'test-id-123',
                        report_text: 'This is a test report for ESG analysis. It contains environmental, social, and governance test content.',
                        framework: 'general'
                      }
                    });
                    const testEndTime = Date.now();
                    const responseTime = testEndTime - testStartTime;
                    
                    console.log(`⏱️ Test call to analyze-esg-report took ${responseTime}ms to respond`);
                    
                    if (error) {
                      console.error('❌ Test call failed with error:', error);
                      setTestResult({
                        status: 'error',
                        message: `Edge function call failed: ${error.message || 'Unknown error'}`,
                        details: error,
                        responseTime
                      });
                      toast({
                        title: "Test Failed",
                        description: `Edge function call failed: ${error.message || 'Unknown error'}`,
                        variant: "destructive",
                      });
                    } else {
                      console.log('✅ Test call succeeded with result:', data);
                      setTestResult({
                        status: 'success',
                        message: 'Edge function was called successfully!',
                        details: data,
                        responseTime
                      });
                      toast({
                        title: "Test Successful",
                        description: "Edge function was called successfully!",
                      });
                    }
                  } catch (testError: any) {
                    console.error('❌ Test call exception:', testError);
                    const errorDetails = {
                      message: testError.message,
                      name: testError.name,
                      code: testError.code,
                      response: testError.response ? {
                        status: testError.response.status,
                        statusText: testError.response.statusText
                      } : 'No response object'
                    };
                    console.error('Detailed test error:', errorDetails);
                    
                    setTestResult({
                      status: 'error',
                      message: `Exception: ${testError.message || 'Unknown error'}`,
                      details: errorDetails
                    });
                    
                    toast({
                      title: "Test Failed",
                      description: `Exception: ${testError.message || 'Unknown error'}`,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Test Edge Function
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}