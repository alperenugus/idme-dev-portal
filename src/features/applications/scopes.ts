import type { Scope } from './types';

/**
 * Scope catalog. Identity scopes are available immediately; community
 * (group-verification) scopes mirror ID.me's model — they require the app to
 * pass review before production release.
 */
export const SCOPE_CATALOG: Scope[] = [
  {
    id: 'openid',
    label: 'OpenID',
    description: 'Authenticate the user and return a stable subject identifier.',
    category: 'identity',
    requiresReview: false,
  },
  {
    id: 'profile',
    label: 'Profile',
    description: 'Basic profile: full name and preferred name.',
    category: 'identity',
    requiresReview: false,
  },
  {
    id: 'email',
    label: 'Email',
    description: "The user's verified email address.",
    category: 'identity',
    requiresReview: false,
  },
  {
    id: 'phone',
    label: 'Phone',
    description: "The user's verified phone number.",
    category: 'identity',
    requiresReview: false,
  },
  {
    id: 'military',
    label: 'Military',
    description: 'Verify active-duty, veteran, or military-family status.',
    category: 'community',
    requiresReview: true,
  },
  {
    id: 'student',
    label: 'Student',
    description: 'Verify current enrollment at an accredited institution.',
    category: 'community',
    requiresReview: true,
  },
  {
    id: 'teacher',
    label: 'Teacher',
    description: 'Verify employment as a licensed educator.',
    category: 'community',
    requiresReview: true,
  },
  {
    id: 'first_responder',
    label: 'First Responder',
    description: 'Verify status as police, fire, or EMS personnel.',
    category: 'community',
    requiresReview: true,
  },
  {
    id: 'nurse',
    label: 'Nurse',
    description: 'Verify an active nursing license.',
    category: 'community',
    requiresReview: true,
  },
];

const SCOPE_BY_ID = new Map(SCOPE_CATALOG.map((s) => [s.id, s]));

export function getScope(id: string): Scope | undefined {
  return SCOPE_BY_ID.get(id);
}

export function scopesRequireReview(scopeIds: string[]): boolean {
  return scopeIds.some((id) => SCOPE_BY_ID.get(id)?.requiresReview);
}

export const IDENTITY_SCOPES = SCOPE_CATALOG.filter(
  (s) => s.category === 'identity',
);
export const COMMUNITY_SCOPES = SCOPE_CATALOG.filter(
  (s) => s.category === 'community',
);
