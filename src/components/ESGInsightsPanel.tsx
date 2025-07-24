import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  CheckCircle, 
  ExternalLink,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ESGInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  actionable: boolean;
  gri_reference?: string;
  impact_score?: number;
  implementation_effort?: string;
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

export function ESGInsightsPanel() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<ESGInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showActionableOnly, setShowActionableOnly] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    if (!user) return;

    try {
      // Get insights from the latest completed report
      const { data: latestReport } = await supabase
        .from('esg_reports')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestReport) {
        setLoading(false);
        return;
      }

      const { data: insightsData } = await supabase
        .from('esg_insights')
        .select('*')
        .eq('report_id', latestReport.id)
        .order('priority', { ascending: false })
        .order('impact_score', { ascending: false });

      if (insightsData) {
        setInsights(insightsData);
      }
    } catch (error) {
      console.error('Error fetching ESG insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (selectedCategory !== 'all' && insight.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && insight.priority !== selectedPriority) return false;
    if (showActionableOnly && !insight.actionable) return false;
    return true;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedInsights(newExpanded);
  };

  const priorityCounts = insights.reduce((acc, insight) => {
    acc[insight.priority] = (acc[insight.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Insights</CardTitle>
          <CardDescription>Loading your sustainability insights...</CardDescription>
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

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Insights</CardTitle>
          <CardDescription>No insights available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Complete your first ESG analysis to receive personalized insights.
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
            <Lightbulb className="h-5 w-5" />
            ESG Insights
          </div>
          <Badge variant="outline">{insights.length} insights</Badge>
        </CardTitle>
        <CardDescription>
          AI-powered recommendations and analysis from your ESG reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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

          <Separator />

          {/* Insights List */}
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredInsights.map((insight) => {
                const typeConfig = insightTypeConfig[insight.insight_type as keyof typeof insightTypeConfig];
                const Icon = typeConfig?.icon || Lightbulb;
                const isExpanded = expandedInsights.has(insight.id);

                return (
                  <div key={insight.id} className="border rounded-lg p-4 space-y-3">
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
                            <Badge variant="outline">{typeConfig?.label || insight.insight_type}</Badge>
                            {insight.actionable && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Actionable
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {insight.description}
                          </p>
                          {insight.gri_reference && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              GRI Reference: {insight.gri_reference}
                            </div>
                          )}
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
                        onClick={() => toggleExpanded(insight.id)}
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
      </CardContent>
    </Card>
  );
}