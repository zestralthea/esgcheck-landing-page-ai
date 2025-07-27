/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 * These provide TypeScript intellisense for import.meta.env
 */
interface ImportMetaEnv {
  /**
   * The URL of your Supabase project
   */
  readonly VITE_SUPABASE_URL: string;
  
  /**
   * The anonymous/public API key for your Supabase project
   */
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
