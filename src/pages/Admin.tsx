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
import { Lock, Users, Settings, Flag, Mail, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  dashboard_access: boolean;
  created_at: string;
  email_confirmed_at: string | null;
}

const Admin = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { flags, loading: flagsLoading, refetch } = useFeatureFlags();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [verifyingUsers, setVerifyingUsers] = useState<Set<string>>(new Set());

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      // Call the edge function to get users with auth status
      const { data, error } = await supabase.functions.invoke('get-users-with-auth-status');

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users with auth status",
          variant: "destructive"
        });
        return;
      }

      if (data?.users) {
        setUsers(data.users);
      } else {
        toast({
          title: "Error",
          description: "Invalid response format",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching users",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleFeatureFlag = async (flagName: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: !currentValue })
        .eq('name', flagName);  // Changed from flag_name to name

      if (error) {
        console.error('Feature flag update error:', error);
        
        // Check for permission errors
        if (error.code === '42501' || error.message.includes('insufficient privileges')) {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to update feature flags. Admin access required.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to update feature flag: ${error.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: `Feature flag ${flagName} ${!currentValue ? 'enabled' : 'disabled'}`
      });

      refetch();
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the feature flag",
        variant: "destructive"
      });
    }
  };

  const toggleUserDashboardAccess = async (userId: string, currentAccess: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_access: !currentAccess })
        .eq('id', userId);

      if (error) {
        console.error('User access update error:', error);
        
        // Check for permission errors
        if (error.code === '42501' || error.message.includes('insufficient privileges')) {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to update user access. Admin access required.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to update user access: ${error.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: `User dashboard access ${!currentAccess ? 'granted' : 'revoked'}`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user access:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating user access",
        variant: "destructive"
      });
    }
  };

  const verifyUserEmail = async (userId: string, userEmail: string) => {
    setVerifyingUsers(prev => new Set(prev).add(userId));
    
    try {
      const { data, error } = await supabase.rpc('manually_verify_user', {
        user_identifier: userEmail
      });

      if (error) {
        console.error('Email verification error:', error);
        toast({
          title: "Error",
          description: `Failed to verify email: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      // Type assertion for the JSON response
      const result = data as { success: boolean; message: string };

      if (result?.success) {
        toast({
          title: "Success",
          description: `Email verified for ${userEmail}`
        });
        
        // Update the user's verification status locally
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId 
              ? { ...u, email_confirmed_at: new Date().toISOString() }
              : u
          )
        );
      } else {
        toast({
          title: "Verification Failed",
          description: result?.message || "Unable to verify email",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying user email:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while verifying email",
        variant: "destructive"
      });
    } finally {
      setVerifyingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Feature Flags
                  </CardTitle>
                  <CardDescription>
                    Control application features and access
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetch}
                  disabled={flagsLoading}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(flags).map(([flagName, isEnabled]) => (
                <div key={flagName} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{flagName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p className="text-sm text-muted-foreground">
                      {flagName === 'dashboard_enabled' && 'Controls global dashboard access'}
                      {flagName === 'dashboard_beta_access' && 'Controls beta feature access'}
                      {flagName === 'auth_public_access' && 'Controls whether authentication (sign in/sign up) is publicly accessible'}
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
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {userData.role}
                          </Badge>
                          {userData.dashboard_access && (
                            <Badge variant="default" className="text-xs">
                              Dashboard Access
                            </Badge>
                          )}
                          <Badge 
                            variant={userData.email_confirmed_at ? "default" : "destructive"} 
                            className="text-xs flex items-center gap-1"
                          >
                            {userData.email_confirmed_at ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </>
                            ) : (
                              <>
                                <Mail className="h-3 w-3" />
                                Unverified
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!userData.email_confirmed_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyUserEmail(userData.id, userData.email)}
                            disabled={verifyingUsers.has(userData.id)}
                          >
                            {verifyingUsers.has(userData.id) ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                            ) : (
                              <>
                                <Mail className="h-3 w-3 mr-1" />
                                Verify Email
                              </>
                            )}
                          </Button>
                        )}
                        <Switch
                          checked={userData.dashboard_access}
                          onCheckedChange={() => toggleUserDashboardAccess(userData.id, userData.dashboard_access)}
                          disabled={userData.id === user.id} // Can't modify own access
                        />
                      </div>
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