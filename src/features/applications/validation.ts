import type { CreateApplicationInput } from './types';

export const NAME_MIN = 3;
export const NAME_MAX = 60;
export const DESCRIPTION_MAX = 280;
export const MAX_REDIRECT_URIS = 10;

export type FieldErrors = Partial<Record<keyof CreateApplicationInput, string>>;

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Application name is required.';
  if (trimmed.length < NAME_MIN)
    return `Name must be at least ${NAME_MIN} characters.`;
  if (trimmed.length > NAME_MAX)
    return `Name must be ${NAME_MAX} characters or fewer.`;
  return null;
}

export function validateDescription(description: string): string | null {
  if (description.length > DESCRIPTION_MAX)
    return `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  return null;
}

/** A single redirect URI: absolute, https (localhost may be http), no fragment. */
export function validateRedirectUri(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Redirect URI cannot be empty.';

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return 'Enter a valid absolute URL (including https://).';
  }

  const isLocalhost =
    url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocalhost)) {
    return 'Redirect URIs must use https (http is allowed only for localhost).';
  }
  if (url.hash) return 'Redirect URIs must not contain a fragment (#).';
  return null;
}

export function validateRedirectUris(uris: string[]): string | null {
  const nonEmpty = uris.map((u) => u.trim()).filter((u) => u.length > 0);
  if (nonEmpty.length === 0) return 'Add at least one redirect URI.';
  if (nonEmpty.length > MAX_REDIRECT_URIS)
    return `A maximum of ${MAX_REDIRECT_URIS} redirect URIs is allowed.`;

  const seen = new Set<string>();
  for (const uri of nonEmpty) {
    const single = validateRedirectUri(uri);
    if (single) return single;
    if (seen.has(uri)) return 'Redirect URIs must be unique.';
    seen.add(uri);
  }
  return null;
}

export function validateScopes(scopes: string[]): string | null {
  if (scopes.length === 0) return 'Select at least one scope.';
  if (!scopes.includes('openid'))
    return 'The "openid" scope is required for OpenID Connect.';
  return null;
}

export function validateCreateInput(input: CreateApplicationInput): {
  valid: boolean;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};

  const nameError = validateName(input.name);
  if (nameError) errors.name = nameError;

  const descriptionError = validateDescription(input.description);
  if (descriptionError) errors.description = descriptionError;

  const redirectError = validateRedirectUris(input.redirectUris);
  if (redirectError) errors.redirectUris = redirectError;

  const scopeError = validateScopes(input.scopes);
  if (scopeError) errors.scopes = scopeError;

  return { valid: Object.keys(errors).length === 0, errors };
}
