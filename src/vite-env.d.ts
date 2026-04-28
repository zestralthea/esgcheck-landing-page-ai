/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 * These provide TypeScript intellisense for import.meta.env
 */
interface ImportMetaEnv {
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
