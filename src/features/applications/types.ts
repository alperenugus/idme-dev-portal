export type ApplicationEnvironment = 'sandbox' | 'production';

/**
 * Lifecycle:
 *  active    — created; sandbox-usable immediately (identity scopes only)
 *  in_review — community/group scopes requested; awaiting ID.me review
 *  approved  — review passed; production access granted
 *  rejected  — review failed
 */
export type ApplicationStatus = 'active' | 'in_review' | 'approved' | 'rejected';

export type ScopeCategory = 'identity' | 'community';

export interface Scope {
  id: string;
  label: string;
  description: string;
  category: ScopeCategory;
  /** Community scopes gate the app into review before production release. */
  requiresReview: boolean;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  redirectUris: string[];
  scopes: string[];
  environment: ApplicationEnvironment;
  status: ApplicationStatus;
  clientId: string;
  createdAt: string;
}

/** Returned only from a create call — the secret is shown exactly once. */
export interface ApplicationWithSecret extends Application {
  clientSecret: string;
}

export interface CreateApplicationInput {
  name: string;
  description: string;
  redirectUris: string[];
  scopes: string[];
  environment: ApplicationEnvironment;
}
