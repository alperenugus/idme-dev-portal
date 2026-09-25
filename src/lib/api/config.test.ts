import { describe, expect, it } from 'vitest';
import {
  API_VERSIONS,
  buildVersionedPath,
  DEFAULT_API_VERSION,
  getApiBaseUrl,
} from './config';

describe('api config', () => {
  it('exposes known versions with v1 as default', () => {
    expect(API_VERSIONS).toContain('v1');
    expect(API_VERSIONS).toContain('v2');
    expect(DEFAULT_API_VERSION).toBe('v1');
  });

  it('builds a versioned path, normalizing the leading slash', () => {
    expect(buildVersionedPath('v1', 'applications')).toBe('/api/v1/applications');
    expect(buildVersionedPath('v2', '/applications')).toBe(
      '/api/v2/applications',
    );
  });

  it('returns an absolute base url in a browser context (no trailing slash)', () => {
    const base = getApiBaseUrl();
    expect(base).toMatch(/^https?:\/\//);
    expect(base.endsWith('/')).toBe(false);
  });
});
