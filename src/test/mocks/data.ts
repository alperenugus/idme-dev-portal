import type { Session, User } from '../../features/auth/types';
import type {
  Application,
  ApplicationWithSecret,
  CreateApplicationInput,
} from '../../features/applications/types';
import { scopesRequireReview } from '../../features/applications/scopes';

interface MockAccount {
  password: string;
  user: User;
}

/** Demo accounts. Password is the same for all; role drives authorization. */
export const MOCK_ACCOUNTS: Record<string, MockAccount> = {
  'developer@acme.test': {
    password: 'password',
    user: {
      id: 'usr_dev',
      name: 'Dana Developer',
      email: 'developer@acme.test',
      organizationId: 'org_acme',
      organizationName: 'Acme, Inc.',
      roles: ['developer'],
    },
  },
  'owner@acme.test': {
    password: 'password',
    user: {
      id: 'usr_owner',
      name: 'Olivia Owner',
      email: 'owner@acme.test',
      organizationId: 'org_acme',
      organizationName: 'Acme, Inc.',
      roles: ['owner'],
    },
  },
  'viewer@acme.test': {
    password: 'password',
    user: {
      id: 'usr_view',
      name: 'Victor Viewer',
      email: 'viewer@acme.test',
      organizationId: 'org_acme',
      organizationName: 'Acme, Inc.',
      roles: ['viewer'],
    },
  },
};

function randomToken(prefix: string, bytes = 16): string {
  const arr = new Uint8Array(bytes);
  (globalThis.crypto ?? crypto).getRandomValues(arr);
  const hex = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
}

export function createSession(email: string): Session | null {
  const account = MOCK_ACCOUNTS[email.toLowerCase()];
  if (!account) return null;
  return {
    token: randomToken('sess'),
    user: account.user,
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
  };
}

export function authenticate(email: string, password: string): Session | null {
  const account = MOCK_ACCOUNTS[email.toLowerCase()];
  if (!account || account.password !== password) return null;
  return createSession(email);
}

// --- Applications store (in-memory, per session) ---

let applications: Application[] = [];

export function resetApplications(seed: Application[] = []): void {
  applications = [...seed];
}

export function listApplications(): Application[] {
  return applications;
}

export function createApplication(
  input: CreateApplicationInput,
): ApplicationWithSecret {
  const needsReview =
    input.environment === 'production' || scopesRequireReview(input.scopes);

  const application: Application = {
    id: randomToken('app', 8),
    name: input.name,
    description: input.description,
    redirectUris: input.redirectUris,
    scopes: input.scopes,
    environment: input.environment,
    status: needsReview ? 'in_review' : 'active',
    clientId: randomToken('idme', 12),
    createdAt: new Date().toISOString(),
  };

  applications = [application, ...applications];

  return { ...application, clientSecret: randomToken('secret', 24) };
}
