import { http, HttpResponse } from 'msw';
import type { LoginCredentials } from '../../features/auth/types';
import type { CreateApplicationInput } from '../../features/applications/types';
import { validateCreateInput } from '../../features/applications/validation';
import {
  authenticate,
  createApplication,
  listApplications,
} from './data';

const BASE = '/api/v1';

function fieldErrorResponse(errors: Record<string, string>) {
  return HttpResponse.json(
    {
      error: {
        message: 'Validation failed.',
        fields: Object.entries(errors).map(([field, message]) => ({
          field,
          message,
        })),
      },
      requestId: 'req_mock',
    },
    { status: 422 },
  );
}

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as LoginCredentials;
    const session = authenticate(body?.email ?? '', body?.password ?? '');
    if (!session) {
      return HttpResponse.json(
        { error: { message: 'Invalid email or password.' } },
        { status: 401 },
      );
    }
    return HttpResponse.json(session, { status: 200 });
  }),

  http.post(`${BASE}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${BASE}/applications`, ({ request }) => {
    if (!request.headers.get('authorization')) {
      return HttpResponse.json(
        { error: { message: 'Authentication required.' } },
        { status: 401 },
      );
    }
    return HttpResponse.json(listApplications(), { status: 200 });
  }),

  http.post(`${BASE}/applications`, async ({ request }) => {
    if (!request.headers.get('authorization')) {
      return HttpResponse.json(
        { error: { message: 'Authentication required.' } },
        { status: 401 },
      );
    }
    const input = (await request.json()) as CreateApplicationInput;
    const { valid, errors } = validateCreateInput(input);
    if (!valid) {
      return fieldErrorResponse(errors as Record<string, string>);
    }
    return HttpResponse.json(createApplication(input), { status: 201 });
  }),
];
