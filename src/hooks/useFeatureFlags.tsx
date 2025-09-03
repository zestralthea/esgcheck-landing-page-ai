import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Development mode flag - set to true to enable features for testing
// Keep in sync with DEV_MODE in AuthContext
const DEV_MODE = true; // Set to false in production

// Features to enable in development mode
const DEV_ENABLED_FLAGS = [
  'dashboard_enabled', 
  'dashboard_beta_access',
  'advanced_analytics',
  'esg_upload_enabled',
  'esg_analysis_enabled',
  'auth_public_access'
];

interface FeatureFlag {
  id: string;
  name: string;  // Changed from flag_name to name to match database schema
  is_enabled: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*');

      if (error) {
        setError(error.message);
        return;
      }

      const flagsMap = data.reduce((acc, flag: FeatureFlag) => {
        acc[flag.name] = flag.is_enabled;  // Changed from flag.flag_name to flag.name
        return acc;
      }, {} as Record<string, boolean>);

      setFlags(flagsMap);
      setError(null);
    } catch (err) {
      setError('Failed to fetch feature flags');
      console.error('Error fetching feature flags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();

    // Subscribe to real-time changes in feature_flags table
    const channel = supabase
      .channel('feature-flags-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'feature_flags'
        },
        (payload) => {
          console.log('Feature flag change detected:', payload);
          
          // Handle different event types
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedFlag = payload.new as FeatureFlag;
            setFlags(prev => ({
              ...prev,
              [updatedFlag.name]: updatedFlag.is_enabled  // Changed from flag_name to name
            }));
          } else if (payload.eventType === 'INSERT' && payload.new) {
            const newFlag = payload.new as FeatureFlag;
            setFlags(prev => ({
              ...prev,
              [newFlag.name]: newFlag.is_enabled  // Changed from flag_name to name
            }));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedFlag = payload.old as FeatureFlag;
            setFlags(prev => {
              const updated = { ...prev };
              delete updated[deletedFlag.name];  // Changed from flag_name to name
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isEnabled = (flagName: string): boolean => {
    // In development mode, enable specific features for testing
    if (DEV_MODE && DEV_ENABLED_FLAGS.includes(flagName)) {
      console.log(`🔧 DEV MODE: Feature '${flagName}' forcibly enabled`);
      return true;
    }
    
    // Normal production logic
    // If still loading, we don't know the state yet
    if (loading) {
      return false;
    }
    
    // If flags object is empty but we're not loading, something went wrong
    if (Object.keys(flags).length === 0 && !loading) {
      return false;
    }
    
    // Return the actual flag value, defaulting to false if not found
    return flags[flagName] || false;
  };

  const isFlagLoaded = (flagName: string): boolean => {
    // Return true when we've finished loading, regardless of whether the specific flag exists
    // This allows missing flags to default to false gracefully
    return !loading;
  };

  return {
    flags,
    loading,
    error,
    isEnabled,
    isFlagLoaded,
    refetch: fetchFlags
  };
};