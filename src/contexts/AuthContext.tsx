import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sessionManager } from '@/lib/sessionSecurity';
import { CSRFProtection, SecureErrorHandler, CSPHelper } from '@/lib/securityUtils';

// Development mode flag - DISABLED for production security
const DEV_MODE = false; // CRITICAL: Must remain false in production

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  dashboard_access: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet, this is normal for new users
        console.log('Profile not found, will be created by trigger');
        return null;
      }

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Ensure all required fields are present with defaults
      return {
        ...data,
        email: data.email || '',
        role: data.role || 'user',
        dashboard_access: data.dashboard_access ?? true
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Initialize security features
    CSPHelper.setMetaCSP();
    CSRFProtection.setToken();

    if (DEV_MODE) {
      console.log('🔧 DEVELOPMENT MODE: Auto-login enabled');
      // Create mock user and profile for development testing
      const mockUser: User = {
        id: 'dev-user-id-123',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'dev@example.com',
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      };

      const mockProfile: Profile = {
        id: 'dev-user-id-123',
        email: 'dev@example.com',
        full_name: 'Development User',
        role: 'admin',
        dashboard_access: true, // Important: This allows access to the dashboard
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Set mock user and profile
      setUser(mockUser);
      setProfile(mockProfile);
      setSession({ access_token: 'mock-token', refresh_token: 'mock-refresh', user: mockUser, expires_at: 9999999999 } as Session);
      setLoading(false);
    } else {
      // Normal authentication flow for production
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            // Start session monitoring for authenticated users
            sessionManager.startSessionMonitoring();
            
            // Defer profile fetching to avoid blocking auth state change
            setTimeout(async () => {
              try {
                const profileData = await fetchProfile(session.user.id);
                if (profileData) {
                  setProfile({
                    ...profileData,
                    email: profileData.email || session.user.email || '',
                    role: profileData.role || 'user',
                    dashboard_access: profileData.dashboard_access ?? true
                  });
                }
              } catch (error) {
                SecureErrorHandler.logError(error, 'Profile fetch during auth state change');
              }
            }, 0);
          } else {
            // Stop session monitoring for unauthenticated users
            sessionManager.stopSessionMonitoring();
            CSRFProtection.clearToken();
            setProfile(null);
          }

          setLoading(false);
        }
      );

      // THEN check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSession(session);
          setUser(session.user);
          fetchProfile(session.user.id).then(profile => {
            if (profile) {
              setProfile({
                ...profile,
                email: profile.email || session.user.email || '',
                role: profile.role || 'user',
                dashboard_access: profile.dashboard_access ?? true
              });
            }
          }).catch(error => {
            SecureErrorHandler.logError(error, 'Initial profile fetch');
          });
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        SecureErrorHandler.logError(error, 'Sign up attempt');
        // Return sanitized error message
        return { 
          error: { 
            ...error, 
            message: SecureErrorHandler.getPublicErrorMessage(error) 
          } 
        };
      }

      return { error: null };
    } catch (error) {
      SecureErrorHandler.logError(error, 'Sign up error');
      return { error: { message: 'An error occurred during sign up' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        SecureErrorHandler.logError(error, 'Sign in attempt');
        // Return sanitized error message
        return { 
          error: { 
            ...error, 
            message: SecureErrorHandler.getPublicErrorMessage(error) 
          } 
        };
      }

      return { error: null };
    } catch (error) {
      SecureErrorHandler.logError(error, 'Sign in error');
      return { error: { message: 'An error occurred during sign in' } };
    }
  };

  const signOut = async () => {
    try {
      // Stop session monitoring before signing out
      sessionManager.stopSessionMonitoring();
      CSRFProtection.clearToken();
      await supabase.auth.signOut();
    } catch (error) {
      SecureErrorHandler.logError(error, 'Sign out error');
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};