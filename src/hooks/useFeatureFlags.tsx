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