import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  FileText, 
  Activity,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SuspiciousActivity {
  user_id: string;
  access_count: number;
  distinct_documents: number;
  first_access: string;
  last_access: string;
  suspicious_score: number;
}

interface AccessStats {
  total_accesses: number;
  unique_users: number;
  unique_documents: number;
  success_rate: number;
  signed_url_usage_rate: number;
  top_access_type: string;
  peak_hour: number;
}

const SecurityDashboard = () => {
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivity[]>([]);
  const [accessStats, setAccessStats] = useState<AccessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchSecurityData = async () => {
    try {
      // Fetch recent access logs for analysis
      const { data: logsData, error: logsError } = await supabase
        .from('document_access_logs')
        .select('*')
        .gte('accessed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('accessed_at', { ascending: false });

      if (logsError) {
        console.error('Error fetching access logs:', logsError);
        toast.error("Error loading access data");
        return;
      }

      // Analyze the data for suspicious activity
      const userActivity: { [userId: string]: any } = {};
      const hourlyStats: { [hour: number]: number } = {};
      const accessTypeStats: { [type: string]: number } = {};
      let totalAccesses = logsData?.length || 0;
      let successfulAccesses = 0;
      let signedUrlAccesses = 0;

      logsData?.forEach(log => {
        // Track user activity
        if (log.user_id) {
          if (!userActivity[log.user_id]) {
            userActivity[log.user_id] = {
              user_id: log.user_id,
              access_count: 0,
              distinct_documents: new Set(),
              first_access: log.accessed_at,
              last_access: log.accessed_at
            };
          }
          userActivity[log.user_id].access_count++;
          userActivity[log.user_id].distinct_documents.add(log.document_id);
          if (log.accessed_at < userActivity[log.user_id].first_access) {
            userActivity[log.user_id].first_access = log.accessed_at;
          }
          if (log.accessed_at > userActivity[log.user_id].last_access) {
            userActivity[log.user_id].last_access = log.accessed_at;
          }
        }

        // Track hourly activity
        const hour = new Date(log.accessed_at).getHours();
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;

        // Track access types
        accessTypeStats[log.access_type] = (accessTypeStats[log.access_type] || 0) + 1;

        // Track success rate
        if (log.success) successfulAccesses++;

        // Track signed URL usage
        if (log.access_type.includes('signed_url')) signedUrlAccesses++;
      });

      // Calculate suspicious activity
      const suspicious: SuspiciousActivity[] = Object.values(userActivity)
        .map((user: any) => ({
          ...user,
          distinct_documents: user.distinct_documents.size,
          suspicious_score: calculateSuspiciousScore(user)
        }))
        .filter((user: any) => user.suspicious_score > 40)
        .sort((a, b) => b.suspicious_score - a.suspicious_score);

      setSuspiciousActivity(suspicious);

      // Calculate statistics
      const uniqueUsers = Object.keys(userActivity).length;
      const uniqueDocuments = new Set(logsData?.map(log => log.document_id)).size;
      const successRate = totalAccesses > 0 ? Math.round((successfulAccesses / totalAccesses) * 100) : 0;
      const signedUrlRate = totalAccesses > 0 ? Math.round((signedUrlAccesses / totalAccesses) * 100) : 0;
      const topAccessType = Object.entries(accessTypeStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
      const peakHour = Object.entries(hourlyStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 0;

      setAccessStats({
        total_accesses: totalAccesses,
        unique_users: uniqueUsers,
        unique_documents: uniqueDocuments,
        success_rate: successRate,
        signed_url_usage_rate: signedUrlRate,
        top_access_type: topAccessType,
        peak_hour: parseInt(peakHour.toString())
      });

    } catch (error: any) {
      console.error('Error fetching security data:', error);
      toast.error("Error loading security data");
    } finally {
      setLoading(false);
    }
  };

  const calculateSuspiciousScore = (user: any): number => {
    let score = 0;
    
    // High access count in short time
    if (user.access_count > 50) score += 40;
    else if (user.access_count > 20) score += 20;
    
    // Low document diversity (accessing same document repeatedly)
    const diversity = user.distinct_documents / user.access_count;
    if (diversity < 0.1) score += 40;
    else if (diversity < 0.3) score += 20;
    
    // Time-based activity (all activity in short window)
    const timeSpan = new Date(user.last_access).getTime() - new Date(user.first_access).getTime();
    const minutes = timeSpan / (1000 * 60);
    if (minutes < 5 && user.access_count > 10) score += 30;
    
    return Math.min(score, 100);
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const getSeverityColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getSeverityLabel = (score: number) => {
    if (score >= 80) return 'High Risk';
    if (score >= 60) return 'Medium Risk';
    if (score >= 40) return 'Low Risk';
    return 'Normal';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <div>
                  <CardTitle>Security Dashboard</CardTitle>
                  <CardDescription>
                    Monitor document access patterns and detect suspicious activity
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isExpanded && accessStats && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      {accessStats.total_accesses} accesses
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {accessStats.unique_users} users
                    </span>
                    {suspiciousActivity.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {suspiciousActivity.length} alerts
                      </Badge>
                    )}
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={fetchSecurityData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">

            {/* Statistics Overview */}
            {accessStats && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accesses</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accessStats.total_accesses}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accessStats.unique_users}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accessStats.success_rate}%</div>
              <p className="text-xs text-muted-foreground">Access success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signed URLs</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accessStats.signed_url_usage_rate}%</div>
              <p className="text-xs text-muted-foreground">URL-based access</p>
            </CardContent>
          </Card>
              </div>
            )}

            {/* Suspicious Activity */}
            <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Suspicious Activity Detection
          </CardTitle>
          <CardDescription>
            Automated detection of unusual access patterns in the last hour
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suspiciousActivity.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-4 text-lg font-semibold text-green-800">All Clear</h3>
              <p className="text-muted-foreground">
                No suspicious activity detected in the last hour
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suspiciousActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className={getSeverityColor(activity.suspicious_score)}
                      >
                        {getSeverityLabel(activity.suspicious_score)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {activity.suspicious_score}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">User ID:</span>
                        <p className="text-muted-foreground truncate">
                          {activity.user_id}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Total Accesses:</span>
                        <p className="text-muted-foreground">
                          {activity.access_count}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Documents:</span>
                        <p className="text-muted-foreground">
                          {activity.distinct_documents}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p className="text-muted-foreground">
                          {formatDate(activity.first_access)} - {formatDate(activity.last_access)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
            </Card>

            {/* Additional Security Insights */}
            {accessStats && (
              <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Access Patterns</CardTitle>
              <CardDescription>Insights from document access behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Most Common Access Type:</span>
                <Badge variant="secondary">{accessStats.top_access_type?.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Peak Activity Hour:</span>
                <Badge variant="outline">{accessStats.peak_hour}:00</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Documents Accessed:</span>
                <span className="text-sm text-muted-foreground">{accessStats.unique_documents}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>Suggestions to improve document security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Access Logging Active</p>
                  <p className="text-xs text-muted-foreground">
                    All document access is being tracked and monitored
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Signed URLs Monitored</p>
                  <p className="text-xs text-muted-foreground">
                    Direct storage access is being logged for audit purposes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Anomaly Detection</p>
                  <p className="text-xs text-muted-foreground">
                    Suspicious access patterns are automatically flagged
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          )}
        </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default SecurityDashboard;