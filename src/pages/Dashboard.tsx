import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Lock, Settings, BarChart3, Users, FileText, Bell, FolderOpen } from 'lucide-react';

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

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest dashboard activities and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="font-medium">Dashboard access granted</p>
                      <p className="text-sm text-muted-foreground">Welcome to the dashboard!</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Just now</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                    <div className="flex-1">
                      <p className="font-medium">Profile updated</p>
                      <p className="text-sm text-muted-foreground">Your profile information was updated</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and actions you can perform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => window.location.href = '/documents'}
                  >
                    <FolderOpen className="h-5 w-5" />
                    Documents
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Settings className="h-5 w-5" />
                    Settings
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Users className="h-5 w-5" />
                    Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>
                  Current feature availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dashboard</span>
                  <Badge variant={isEnabled('dashboard_enabled') ? 'default' : 'secondary'}>
                    {isEnabled('dashboard_enabled') ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Beta Features</span>
                  <Badge variant={isEnabled('dashboard_beta_access') ? 'default' : 'secondary'}>
                    {isEnabled('dashboard_beta_access') ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;