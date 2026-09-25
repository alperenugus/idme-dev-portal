/**
 * API versioning configuration.
 *
 * Versioning is path-based (`/api/v1/...`) with an accompanying `X-API-Version`
 * header so a gateway can negotiate either way. New versions are added here and
 * selected per-request; `DEFAULT_API_VERSION` is the app-wide default.
 */

export const API_VERSIONS = ['v1', 'v2'] as const;
export type ApiVersion = (typeof API_VERSIONS)[number];

export const DEFAULT_API_VERSION: ApiVersion = 'v1';

/**
 * Base URL for the API.
 *
 * Priority: an explicit `VITE_API_BASE_URL` (cross-origin deployments) →
 * the current page origin (same-origin API; also what jsdom/undici needs, since
 * Node's fetch rejects relative URLs) → empty string (non-browser fallback).
 * The mock service worker intercepts same-origin requests either way.
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env?.VITE_API_BASE_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export function buildVersionedPath(version: ApiVersion, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/api/${version}${normalized}`;
}
