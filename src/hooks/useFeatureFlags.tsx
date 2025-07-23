import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlag {
  id: string;
  flag_name: string;
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
        acc[flag.flag_name] = flag.is_enabled;
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
              [updatedFlag.flag_name]: updatedFlag.is_enabled
            }));
          } else if (payload.eventType === 'INSERT' && payload.new) {
            const newFlag = payload.new as FeatureFlag;
            setFlags(prev => ({
              ...prev,
              [newFlag.flag_name]: newFlag.is_enabled
            }));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedFlag = payload.old as FeatureFlag;
            setFlags(prev => {
              const updated = { ...prev };
              delete updated[deletedFlag.flag_name];
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
    return flags[flagName] || false;
  };

  return {
    flags,
    loading,
    error,
    isEnabled,
    refetch: fetchFlags
  };
};