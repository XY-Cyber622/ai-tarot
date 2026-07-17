/**
 * Vite environment type augmentations.
 * - All env vars must be prefixed with VITE_ to be exposed to the client.
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_API_BASE: string;
  readonly VITE_API_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
