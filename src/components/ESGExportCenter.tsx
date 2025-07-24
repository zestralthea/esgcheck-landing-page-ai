import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Mail, 
  Share2,
  Loader2,
  Calendar,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportOptions {
  includeScores: boolean;
  includeInsights: boolean;
  includeRecommendations: boolean;
  includeCharts: boolean;
  includeBenchmarks: boolean;
  format: 'pdf' | 'xlsx' | 'csv';
  period: 'latest' | 'all' | 'year';
}

export function ESGExportCenter() {
  const { toast } = useToast();
  const [options, setOptions] = useState<ExportOptions>({
    includeScores: true,
    includeInsights: true,
    includeRecommendations: false,
    includeCharts: false,
    includeBenchmarks: false,
    format: 'pdf',
    period: 'latest',
  });
  const [exporting, setExporting] = useState(false);

  const updateOption = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export completed",
        description: `Your ESG report has been exported as ${options.format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      // Simulate share functionality
      toast({
        title: "Share link generated",
        description: "A shareable link has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "There was an error generating the share link",
        variant: "destructive",
      });
    }
  };

  const handleEmail = async () => {
    try {
      // Simulate email functionality
      toast({
        title: "Email sent",
        description: "Your ESG report has been sent to the specified recipients",
      });
    } catch (error) {
      toast({
        title: "Email failed",
        description: "There was an error sending the email",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Share Center
        </CardTitle>
        <CardDescription>
          Export your ESG data and share reports with stakeholders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <h4 className="font-medium">Export Configuration</h4>
          </div>
          
          {/* Content Selection */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Include in Export:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scores"
                  checked={options.includeScores}
                  onCheckedChange={(checked) => updateOption('includeScores', checked)}
                />
                <label htmlFor="scores" className="text-sm">ESG Scores</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insights"
                  checked={options.includeInsights}
                  onCheckedChange={(checked) => updateOption('includeInsights', checked)}
                />
                <label htmlFor="insights" className="text-sm">Key Insights</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={options.includeRecommendations}
                  onCheckedChange={(checked) => updateOption('includeRecommendations', checked)}
                />
                <label htmlFor="recommendations" className="text-sm">Recommendations</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={options.includeCharts}
                  onCheckedChange={(checked) => updateOption('includeCharts', checked)}
                />
                <label htmlFor="charts" className="text-sm">Charts & Graphs</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="benchmarks"
                  checked={options.includeBenchmarks}
                  onCheckedChange={(checked) => updateOption('includeBenchmarks', checked)}
                />
                <label htmlFor="benchmarks" className="text-sm">Industry Benchmarks</label>
              </div>
            </div>
          </div>

          {/* Format and Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={options.format} onValueChange={(value) => updateOption('format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={options.period} onValueChange={(value) => updateOption('period', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest Report</SelectItem>
                  <SelectItem value="year">Current Year</SelectItem>
                  <SelectItem value="all">All Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Export Summary */}
        <div className="space-y-3">
          <h4 className="font-medium">Export Summary</h4>
          <div className="flex flex-wrap gap-2">
            {options.includeScores && <Badge variant="outline">ESG Scores</Badge>}
            {options.includeInsights && <Badge variant="outline">Key Insights</Badge>}
            {options.includeRecommendations && <Badge variant="outline">Recommendations</Badge>}
            {options.includeCharts && <Badge variant="outline">Charts & Graphs</Badge>}
            {options.includeBenchmarks && <Badge variant="outline">Industry Benchmarks</Badge>}
          </div>
          <div className="text-sm text-muted-foreground">
            Format: {options.format.toUpperCase()} • Period: {options.period}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <h4 className="font-medium">Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? 'Exporting...' : 'Download'}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Generate Link
            </Button>
            <Button
              variant="outline"
              onClick={handleEmail}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Report
            </Button>
          </div>
        </div>

        {/* Quick Export Templates */}
        <div className="space-y-3">
          <h4 className="font-medium">Quick Templates</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Executive Summary</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                High-level overview with key scores and insights
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Export Summary
              </Button>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Detailed Analysis</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Complete report with all metrics and recommendations
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Export Full Report
              </Button>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}