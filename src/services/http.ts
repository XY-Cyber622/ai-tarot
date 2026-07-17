import axios, { type AxiosInstance, type AxiosError } from 'axios';

/**
 * Shared Axios instance configured for the LLM provider.
 * Reads base URL and API key from `import.meta.env`.
 *
 * NOTE: The API key is sent from the browser, so it WILL appear in the
 * production bundle. This is fine for learning / personal projects.
 * For production, proxy requests through a server-side endpoint.
 */

const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY || API_KEY === 'sk-your-qwen-api-key-here') {
  console.warn(
    '[http] VITE_API_KEY is not configured. Copy .env.example to .env and set your key.'
  );
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 60_000, // LLM calls can be slow
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
});

/**
 * Normalize an Axios error into a readable Error with a status code.
 */
export function toApiError(err: unknown): Error & { status?: number } {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ error?: { message?: string } }>;
    const status = ax.response?.status;
    const msg =
      ax.response?.data?.error?.message ||
      ax.message ||
      'Network error';
    const e = new Error(`[HTTP ${status ?? '??'}] ${msg}`) as Error & {
      status?: number;
    };
    e.status = status;
    return e;
  }
  if (err instanceof Error) return err;
  return new Error(String(err));
}

export default http;
