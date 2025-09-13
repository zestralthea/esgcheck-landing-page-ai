import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  CheckCircle,
  ExternalLink,
  Download,
  FileText,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ESGInsight {
  type: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  actionable: boolean;
  impact_score?: number;
  implementation_effort?: string;
}

interface ESGAnalysis {
  id: string;
  report_id: string;
  overall_score: number;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  insights: ESGInsight[];
  full_analysis: any;
  created_at: string;
}

const insightTypeConfig = {
  strength: { icon: CheckCircle, label: 'Strength', color: 'text-green-600', bgColor: 'bg-green-50' },
  weakness: { icon: AlertTriangle, label: 'Weakness', color: 'text-red-600', bgColor: 'bg-red-50' },
  opportunity: { icon: TrendingUp, label: 'Opportunity', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  risk: { icon: AlertTriangle, label: 'Risk', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  recommendation: { icon: Lightbulb, label: 'Recommendation', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  benchmark: { icon: Target, label: 'Benchmark', color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const categoryColors = {
  environmental: 'bg-green-100 text-green-800',
  social: 'bg-blue-100 text-blue-800',
  governance: 'bg-purple-100 text-purple-800',
};

export function AnalysisResultsCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<ESGAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showActionableOnly, setShowActionableOnly] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchLatestAnalysis();
    }
  }, [user]);

  const fetchLatestAnalysis = async () => {
    if (!user) return;

    try {
      // Get the latest analysis with insights from esg_analyses table
      const { data: analysisData } = await supabase
        .from('esg_analyses')
        .select('*')
        .eq('is_latest', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (analysisData) {
        setAnalysis(analysisData);

        // Extract PDF document ID from full_analysis if available
        const fullAnalysis = analysisData.full_analysis as any;
        const pdfDocumentId = fullAnalysis?.pdf_document?.id ||
                             fullAnalysis?.document?.id;

        if (pdfDocumentId) {
          const pdfDownloadUrl = `https://pdfmonkey.io/api/v1/documents/${pdfDocumentId}/download`;
          setPdfUrl(pdfDownloadUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching ESG analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = analysis?.insights?.filter((insight: ESGInsight) => {
    if (selectedCategory !== 'all' && insight.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && insight.priority !== selectedPriority) return false;
    if (showActionableOnly && !insight.actionable) return false;
    return true;
  }) || [];

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedInsights(newExpanded);
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

  const refreshAnalysis = () => {
    setLoading(true);
    fetchLatestAnalysis();
  };

  const priorityCounts = analysis?.insights?.reduce((acc: Record<string, number>, insight: ESGInsight) => {
    acc[insight.priority] = (acc[insight.priority] || 0) + 1;
    return acc;
  }, {}) || {};

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Analysis Results</CardTitle>
          <CardDescription>Loading your analysis results...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Analysis Results</CardTitle>
          <CardDescription>No analysis available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Complete your first ESG analysis to see results here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ESG Analysis Results
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg font-bold">
              Score: {analysis.overall_score?.toFixed(1)}/100
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAnalysis}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          AI-powered analysis with insights and PDF report access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analysis.environmental_score?.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Environmental</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analysis.social_score?.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Social</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analysis.governance_score?.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Governance</div>
            </div>
          </div>

          {/* PDF Access */}
          {pdfUrl && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium">Detailed PDF Report</h3>
                <p className="text-sm text-muted-foreground">
                  Download your comprehensive analysis report
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Insights Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Key Insights
              </h3>
              <Badge variant="outline">{filteredInsights.length} insights</Badge>
            </div>

            {/* Priority Summary */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(priorityCounts).map(([priority, count]) => (
                <Badge key={priority} className={priorityColors[priority as keyof typeof priorityColors]}>
                  {priority}: {count}
                </Badge>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Categories</option>
                <option value="environmental">Environmental</option>
                <option value="social">Social</option>
                <option value="governance">Governance</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Button
                variant={showActionableOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowActionableOnly(!showActionableOnly)}
              >
                Actionable Only
              </Button>
            </div>

            {/* Insights List */}
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {filteredInsights.map((insight, index) => {
                  const typeConfig = insightTypeConfig[insight.type as keyof typeof insightTypeConfig];
                  const Icon = typeConfig?.icon || Lightbulb;
                  const insightId = `${insight.type}-${index}`;
                  const isExpanded = expandedInsights.has(insightId);

                  return (
                    <div key={insightId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${typeConfig?.bgColor || 'bg-gray-50'}`}>
                            <Icon className={`h-4 w-4 ${typeConfig?.color || 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{insight.title}</h4>
                              {insight.impact_score && (
                                <Badge variant="outline" className="text-xs">
                                  Impact: {insight.impact_score}/10
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge className={priorityColors[insight.priority as keyof typeof priorityColors]}>
                                {insight.priority}
                              </Badge>
                              <Badge className={categoryColors[insight.category as keyof typeof categoryColors]}>
                                {insight.category}
                              </Badge>
                              <Badge variant="outline">{typeConfig?.label || insight.type}</Badge>
                              {insight.actionable && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  Actionable
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
                              {insight.description}
                            </p>
                            {insight.implementation_effort && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                Implementation effort: {insight.implementation_effort}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(insightId)}
                        >
                          {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
