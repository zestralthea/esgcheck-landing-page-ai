import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Users, Settings, Flag } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  dashboard_access: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { flags, loading: flagsLoading, refetch } = useFeatureFlags();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleFeatureFlag = async (flagName: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: !currentValue })
        .eq('flag_name', flagName);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update feature flag",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Feature flag ${flagName} ${!currentValue ? 'enabled' : 'disabled'}`
      });

      refetch();
    } catch (error) {
      console.error('Error updating feature flag:', error);
    }
  };

  const toggleUserDashboardAccess = async (userId: string, currentAccess: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_access: !currentAccess })
        .eq('id', userId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update user access",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `User dashboard access ${!currentAccess ? 'granted' : 'revoked'}`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user access:', error);
    }
  };

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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              You need administrator privileges to access this page.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">
                Manage feature flags and user access
              </p>
            </div>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Control application features and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(flags).map(([flagName, isEnabled]) => (
                <div key={flagName} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{flagName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p className="text-sm text-muted-foreground">
                      {flagName === 'dashboard_enabled' && 'Controls global dashboard access'}
                      {flagName === 'dashboard_beta_access' && 'Controls beta feature access'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isEnabled ? 'default' : 'secondary'}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleFeatureFlag(flagName, isEnabled)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user dashboard access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {userData.full_name || 'No name'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {userData.email}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {userData.role}
                          </Badge>
                          {userData.dashboard_access && (
                            <Badge variant="default" className="text-xs">
                              Dashboard Access
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={userData.dashboard_access}
                        onCheckedChange={() => toggleUserDashboardAccess(userData.id, userData.dashboard_access)}
                        disabled={userData.id === user.id} // Can't modify own access
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dashboard Users</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.dashboard_access).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Features</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(flags).filter(Boolean).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;