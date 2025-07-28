/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 * These provide TypeScript intellisense for import.meta.env
 */
interface ImportMetaEnv {
  // Add environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
