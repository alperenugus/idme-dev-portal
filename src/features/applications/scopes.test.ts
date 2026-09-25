import { describe, expect, it } from 'vitest';
import {
  COMMUNITY_SCOPES,
  getScope,
  IDENTITY_SCOPES,
  SCOPE_CATALOG,
  scopesRequireReview,
} from './scopes';

describe('scopes catalog', () => {
  it('partitions identity and community scopes', () => {
    expect(IDENTITY_SCOPES.every((s) => s.category === 'identity')).toBe(true);
    expect(COMMUNITY_SCOPES.every((s) => s.category === 'community')).toBe(true);
    expect(IDENTITY_SCOPES.length + COMMUNITY_SCOPES.length).toBe(
      SCOPE_CATALOG.length,
    );
  });

  it('looks up a scope by id', () => {
    expect(getScope('openid')?.label).toBe('OpenID');
    expect(getScope('missing')).toBeUndefined();
  });

  it('detects when review is required', () => {
    expect(scopesRequireReview(['openid', 'email'])).toBe(false);
    expect(scopesRequireReview(['openid', 'military'])).toBe(true);
    expect(scopesRequireReview([])).toBe(false);
  });
});
