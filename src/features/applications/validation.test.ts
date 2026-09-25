import { describe, expect, it } from 'vitest';
import {
  DESCRIPTION_MAX,
  MAX_REDIRECT_URIS,
  validateCreateInput,
  validateDescription,
  validateName,
  validateRedirectUri,
  validateRedirectUris,
  validateScopes,
} from './validation';
import type { CreateApplicationInput } from './types';

describe('validateName', () => {
  it('rejects empty and whitespace-only names', () => {
    expect(validateName('')).toMatch(/required/);
    expect(validateName('   ')).toMatch(/required/);
  });
  it('enforces minimum length', () => {
    expect(validateName('ab')).toMatch(/at least/);
  });
  it('enforces maximum length', () => {
    expect(validateName('a'.repeat(61))).toMatch(/or fewer/);
  });
  it('accepts a valid name', () => {
    expect(validateName('Acme App')).toBeNull();
  });
});

describe('validateDescription', () => {
  it('accepts an empty description', () => {
    expect(validateDescription('')).toBeNull();
  });
  it('rejects an over-long description', () => {
    expect(validateDescription('x'.repeat(DESCRIPTION_MAX + 1))).toMatch(
      /or fewer/,
    );
  });
});

describe('validateRedirectUri', () => {
  it('rejects empty', () => {
    expect(validateRedirectUri('  ')).toMatch(/cannot be empty/);
  });
  it('rejects non-URLs', () => {
    expect(validateRedirectUri('not a url')).toMatch(/valid absolute URL/);
  });
  it('rejects non-https for non-localhost', () => {
    expect(validateRedirectUri('http://example.com/cb')).toMatch(/https/);
  });
  it('allows http for localhost and 127.0.0.1', () => {
    expect(validateRedirectUri('http://localhost:3000/cb')).toBeNull();
    expect(validateRedirectUri('http://127.0.0.1/cb')).toBeNull();
  });
  it('rejects URLs with a fragment', () => {
    expect(validateRedirectUri('https://example.com/cb#x')).toMatch(/fragment/);
  });
  it('accepts a valid https URI', () => {
    expect(validateRedirectUri('https://example.com/cb')).toBeNull();
  });
});

describe('validateRedirectUris', () => {
  it('requires at least one', () => {
    expect(validateRedirectUris(['', '  '])).toMatch(/at least one/);
  });
  it('rejects too many', () => {
    const many = Array.from(
      { length: MAX_REDIRECT_URIS + 1 },
      (_, i) => `https://example.com/${i}`,
    );
    expect(validateRedirectUris(many)).toMatch(/maximum/);
  });
  it('propagates a single invalid uri', () => {
    expect(validateRedirectUris(['https://ok.com', 'bad'])).toMatch(
      /valid absolute URL/,
    );
  });
  it('rejects duplicates', () => {
    expect(
      validateRedirectUris(['https://a.com/cb', 'https://a.com/cb']),
    ).toMatch(/unique/);
  });
  it('accepts a valid unique list', () => {
    expect(
      validateRedirectUris(['https://a.com/cb', 'https://b.com/cb']),
    ).toBeNull();
  });
});

describe('validateScopes', () => {
  it('requires at least one', () => {
    expect(validateScopes([])).toMatch(/at least one/);
  });
  it('requires openid', () => {
    expect(validateScopes(['email'])).toMatch(/openid/);
  });
  it('accepts a list including openid', () => {
    expect(validateScopes(['openid', 'email'])).toBeNull();
  });
});

describe('validateCreateInput', () => {
  const valid: CreateApplicationInput = {
    name: 'Acme',
    description: '',
    redirectUris: ['https://acme.com/cb'],
    scopes: ['openid'],
    environment: 'sandbox',
  };

  it('returns valid for a good input', () => {
    expect(validateCreateInput(valid)).toEqual({ valid: true, errors: {} });
  });

  it('aggregates all field errors', () => {
    const result = validateCreateInput({
      name: '',
      description: 'x'.repeat(DESCRIPTION_MAX + 1),
      redirectUris: [''],
      scopes: [],
      environment: 'sandbox',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.description).toBeDefined();
    expect(result.errors.redirectUris).toBeDefined();
    expect(result.errors.scopes).toBeDefined();
  });
});
