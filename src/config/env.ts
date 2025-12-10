/**
 * Environment configuration loader
 * Validates and exposes environment variables with type safety
 */

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
    functionUrl: string;
  };
  environment: 'development' | 'production' | 'test';
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

function getRequiredEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new ConfigurationError(
      `Missing required environment variable: ${key}. Please check your .env file.`
    );
  }
  return value;
}

function getOptionalEnvVar(key: string, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

function validateSupabaseUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('supabase')) {
      console.warn('Supabase URL does not appear to be a valid Supabase domain');
    }
  } catch (error) {
    throw new ConfigurationError(`Invalid Supabase URL format: ${url}`);
  }
}

function loadConfig(): AppConfig {
  const supabaseUrl = getRequiredEnvVar('VITE_SUPABASE_URL');
  const supabaseAnonKey = getRequiredEnvVar('VITE_SUPABASE_ANON_KEY');
  
  // Validate URL format
  validateSupabaseUrl(supabaseUrl);
  
  // Derive function URL from base URL
  const functionUrl = `${supabaseUrl}/functions/v1`;
  
  // Determine environment
  const mode = import.meta.env.MODE || 'development';
  const environment = (['development', 'production', 'test'].includes(mode) 
    ? mode 
    : 'development') as 'development' | 'production' | 'test';

  // Validate environment-specific constraints
  if (environment !== 'production' && supabaseUrl.includes('equtqvlukqloqphhmblj')) {
    throw new ConfigurationError(
      'Production Supabase URL detected in non-production environment. ' +
      'Please use a staging or development Supabase project.'
    );
  }

  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      functionUrl,
    },
    environment,
  };
}

// Export singleton config instance
export const config = loadConfig();

// Export type for use in other modules
export type { AppConfig };