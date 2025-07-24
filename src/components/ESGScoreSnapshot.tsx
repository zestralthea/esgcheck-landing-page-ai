import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ESGScore {
  category: string;
  score: number;
  max_score: number;
  confidence_level?: number;
}

interface ESGScoreData {
  environmental: ESGScore | null;
  social: ESGScore | null;
  governance: ESGScore | null;
  overall: ESGScore | null;
}

const categoryConfig = {
  environmental: {
    icon: Leaf,
    label: 'Environmental',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  social: {
    icon: Users,
    label: 'Social',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  governance: {
    icon: Shield,
    label: 'Governance',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  overall: {
    icon: TrendingUp,
    label: 'Overall',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
};

export function ESGScoreSnapshot() {
  const { user } = useAuth();
  const [scores, setScores] = useState<ESGScoreData>({
    environmental: null,
    social: null,
    governance: null,
    overall: null,
  });
  const [loading, setLoading] = useState(true);
  const [hasReports, setHasReports] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLatestScores();
    }
  }, [user]);

  const fetchLatestScores = async () => {
    if (!user) return;

    try {
      // Get the latest completed report
      const { data: latestReport } = await supabase
        .from('esg_reports')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestReport) {
        setHasReports(false);
        setLoading(false);
        return;
      }

      setHasReports(true);

      // Get scores for each category
      const { data: scoresData } = await supabase
        .from('esg_scores')
        .select('category, score, max_score, confidence_level')
        .eq('report_id', latestReport.id);

      if (scoresData) {
        const scoresByCategory = scoresData.reduce((acc, score) => {
          acc[score.category as keyof ESGScoreData] = score;
          return acc;
        }, {} as ESGScoreData);

        setScores(scoresByCategory);
      }
    } catch (error) {
      console.error('Error fetching ESG scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Critical';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Score Snapshot</CardTitle>
          <CardDescription>Loading your latest ESG performance...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasReports) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Score Snapshot</CardTitle>
          <CardDescription>No ESG reports found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Upload your first ESG report to see your sustainability performance scores.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ESG Score Snapshot</CardTitle>
        <CardDescription>Your latest sustainability performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const scoreData = scores[key as keyof ESGScoreData];
            const Icon = config.icon;
            
            if (!scoreData) return null;

            const percentage = (scoreData.score / scoreData.max_score) * 100;
            
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getScoreColor(scoreData.score)}`}>
                      {scoreData.score.toFixed(1)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getScoreDescription(scoreData.score)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>{scoreData.max_score}</span>
                  </div>
                  {scoreData.confidence_level && (
                    <div className="text-xs text-muted-foreground">
                      Confidence: {(scoreData.confidence_level * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}