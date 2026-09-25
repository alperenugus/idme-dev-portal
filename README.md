# Developer Portal — Create Application flow

A production-shaped reference implementation of a developer-portal **"Create
Application"** flow: registering an OAuth 2.0 / OpenID Connect application, in
the shape of ID.me's community-verification model (identity + group scopes,
review gating, one-time client credentials).

**▶ Live demo:** https://idme-dev-portal-production.up.railway.app
**Sign in:** `developer@acme.test` / `password` — or `viewer@acme.test` to see
the authorization gate.

> **Independent portfolio project.** Not affiliated with, endorsed by, or
> connected to ID.me. It uses none of ID.me's code, assets, or branding — the
> flow is an original reconstruction from public developer documentation, built
> to demonstrate frontend architecture. No real backend is contacted: a **Mock
> Service Worker** layer emulates the API in the browser and in tests, so the
> whole flow is fully interactive.

---

## What this demonstrates

- **Component-driven UI architecture** — an original design system (tokens →
  primitives → features), not a UI-kit assembly.
- **State done deliberately** — server state (TanStack Query) and global client
  state (Zustand) are kept separate, with a typed reducer state machine for the
  multi-step wizard.
- **Accessibility as a default** — labelled controls, `aria-invalid`/`describedby`
  wiring, focus + Escape handling, `aria-current` steps, live-region toasts.
- **Testing discipline** — 164 tests, **~99% statement / 97% branch** coverage,
  gated at 90% in CI config.
- **Security literacy** — one-time secret display, `ApiError` taxonomy, and a
  documented production-hardening path (see below).

## Module map

| Concern | Where | Notes |
| --- | --- | --- |
| **API services** | `src/lib/api` | `ApiClient` with auth-token injection, timeouts, normalized `ApiError`. |
| **API versioning** | `src/lib/api/config.ts` | Path-based (`/api/v1`) + `X-API-Version` header; per-request override. |
| **Authentication** | `src/features/auth` | Session store, login/logout orchestration, `ProtectedRoute`. |
| **Authorization (RBAC)** | `permissions.ts`, `RequirePermission` | Roles → permissions; UI gates on permissions, not roles. |
| **Server state** | `@tanstack/react-query` | `useApplications`, `useCreateApplication`; retry keyed off `ApiError.isRetryable`. |
| **Global client state** | `zustand` | Auth session, theme preference, toast queue. |
| **Local flow state** | `wizardState.ts` | Typed `useReducer` state machine. |
| **Theme** | `src/design-system/theme` | Light / dark / system, token-driven, persisted, follows the OS live. |
| **Design system** | `src/design-system` | Tokens + 11 accessible primitives, CSS Modules, zero UI-framework deps. |
| **Tests** | Vitest + RTL + MSW | End-to-end flow coverage, not just units. |

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
```

Demo accounts (password `password`): `developer@acme.test` (can create apps),
`viewer@acme.test` (read-only — authorization gate), `owner@acme.test` (full).

## Scripts

```bash
npm run dev            # Vite dev server
npm run build          # Type-check (tsc -b) + production build
npm start              # Serve the production build (server.js, zero-dep)
npm run test           # Run the test suite once
npm run test:coverage  # Run tests with coverage (fails under 90%)
npm run lint           # ESLint
```

## Architecture

```
src/
├── app/               # composition root: providers, router, query client
├── components/        # app shell (layout, theme toggle)
├── design-system/     # tokens, theme, and reusable primitives
│   ├── theme/         # ThemeProvider + persisted zustand store
│   └── components/    # Button, Input, Modal, Stepper, CopyField, ...
├── features/
│   ├── auth/          # session, RBAC, guards, useAuth
│   └── applications/  # the Create Application flow
│       ├── wizardState.ts   # typed reducer state machine
│       ├── validation.ts    # pure, unit-tested field validation
│       ├── hooks.ts         # react-query read + create
│       └── components/      # wizard + step views + credentials panel
├── lib/api/           # versioned client, error taxonomy, singleton wiring
├── pages/             # Login, CreateApplication, NotFound
├── store/             # global UI store (toasts)
└── test/              # setup + MSW handlers/mocks + render helper
```

### Decisions worth calling out

- **The auth store imports nothing app-specific**, so it can be a dependency of
  the API client (token injection + 401 handling) with no import cycle:
  `authStore ← apiClient ← authService ← useAuth`.
- **`fetch` is resolved per request**, not captured at construction — otherwise a
  singleton built at import time holds a pre-mock `fetch` and bypasses
  interception (a bug this codebase caught and fixed under test).
- **Secrets are shown once.** The create response carries `clientSecret`; the
  list cache is seeded with a secret-stripped copy.
- **Production is served by a zero-dependency Node static server** (`server.js`),
  not `vite preview`, so the runtime needs no devDependencies (avoids the
  "green build, crashed boot" pruning trap on managed platforms).

## Security & production considerations

This is a front-end demo, so a few things are intentionally simplified. The
production-correct versions:

- **Client secret storage.** Generate with a CSPRNG (≥256 bits), show once, and
  store **hashed** (argon2/bcrypt, for a bearer-secret model) or **encrypted at
  rest** via KMS (if the server must reproduce it, e.g. HMAC signing) — never
  plaintext. Compare in constant time.
- **Token storage.** This demo keeps the session in `localStorage` (readable by
  any XSS). Production: an `httpOnly; Secure; SameSite` cookie behind a
  **backend-for-frontend**, or a sender-constrained token (below).
- **Bearer vs. proof-of-possession.** A bearer access token is usable by anyone
  who holds it; mitigate with TLS + short TTL + rotating refresh tokens +
  audience binding + revocation. When token theft is in scope, move to
  **sender-constrained tokens** — **DPoP** (per-request signed proof) or
  **mTLS-bound** tokens — so a stolen token is useless without the private key.
- **Machine-to-machine APIs** can instead use **HMAC request signing** (canonical
  request + timestamp + nonce for replay protection, constant-time compare).

## Deployment

Builds to a static SPA, served by `server.js`. Deployed on Railway; `railway.json`
pins `npm run build` / `npm start`. Point at a real API by setting
`VITE_API_BASE_URL` and removing the MSW bootstrap in `src/main.tsx`.

## Tech

React 18 · TypeScript (strict) · Vite · TanStack Query · Zustand · React Router ·
CSS Modules · Vitest · React Testing Library · MSW.
