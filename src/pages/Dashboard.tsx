import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Lock, Settings, BarChart3, Users, FileText, Bell, FolderOpen, Leaf, Upload, Download } from 'lucide-react';
import { ESGUploadPanel } from '@/components/ESGUploadPanel';
import { ESGScoreSnapshot } from '@/components/ESGScoreSnapshot';
import { ESGInsightsPanel } from '@/components/ESGInsightsPanel';
import { ESGReportsTable } from '@/components/ESGReportsTable';
import { ESGExportCenter } from '@/components/ESGExportCenter';
import ESGReportAuditLog from '@/components/ESGReportAuditLog';

const Dashboard = () => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { isEnabled, loading: flagsLoading } = useFeatureFlags();

  // Show loading while checking auth and feature flags
  if (authLoading || flagsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if dashboard is enabled globally
  if (!isEnabled('dashboard_enabled')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Dashboard Coming Soon</CardTitle>
            <CardDescription>
              The dashboard is currently under development and will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has dashboard access
  if (!profile?.dashboard_access) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have access to the dashboard yet. Please contact support for access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Return to Home
            </Button>
            <Button onClick={signOut} variant="ghost" size="sm">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Total Users",
      value: "1,234",
      icon: Users,
      change: "+12%"
    },
    {
      title: "Analytics",
      value: "5,678",
      icon: BarChart3,
      change: "+8%"
    },
    {
      title: "Reports",
      value: "890",
      icon: FileText,
      change: "+15%"
    },
    {
      title: "Notifications",
      value: "45",
      icon: Bell,
      change: "-3%"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name || user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isEnabled('dashboard_beta_access') && (
                <Badge variant="secondary">Beta Access</Badge>
              )}
              <Badge variant="outline">{profile?.role}</Badge>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    {' '}from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ESG Dashboard Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                <ESGScoreSnapshot />
                <ESGInsightsPanel />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5" />
                      ESG Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Upload className="h-4 w-4" />
                        Upload New Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <BarChart3 className="h-4 w-4" />
                        View Analytics
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Download className="h-4 w-4" />
                        Export Data
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => window.location.href = '/documents'}
                      >
                        <FolderOpen className="h-4 w-4" />
                        All Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    {profile?.full_name && (
                      <div>
                        <p className="text-sm font-medium">Full Name</p>
                        <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Role</p>
                      <Badge variant="outline">{profile?.role}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile?.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ESGUploadPanel />
              </div>
              <div className="lg:col-span-1">
                <ESGReportAuditLog />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ESGReportsTable />
          </TabsContent>

          <TabsContent value="insights">
            <ESGInsightsPanel />
          </TabsContent>

          <TabsContent value="export">
            <div className="max-w-4xl mx-auto">
              <ESGExportCenter />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;