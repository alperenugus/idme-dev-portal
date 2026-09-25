import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from './client';
import { ApiError } from './errors';

interface CapturedRequest {
  url: string;
  init: RequestInit;
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function clientWith(
  impl: (url: string, init: RequestInit) => Promise<Response>,
  extra: Partial<ConstructorParameters<typeof ApiClient>[0]> = {},
) {
  const captured: CapturedRequest[] = [];
  const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    captured.push({ url: String(url), init: init ?? {} });
    return impl(String(url), init ?? {});
  }) as unknown as typeof fetch;
  // Pin an empty base URL so assertions target pure versioned-path construction.
  const client = new ApiClient({ baseUrl: '', fetchImpl, ...extra });
  return { client, captured };
}

describe('ApiClient success paths', () => {
  it('GETs a versioned URL and parses JSON', async () => {
    const { client, captured } = clientWith(async () =>
      jsonResponse([{ id: '1' }]),
    );
    const data = await client.get<{ id: string }[]>('/applications');
    expect(data).toEqual([{ id: '1' }]);
    expect(captured[0]?.url).toBe('/api/v1/applications');
    expect((captured[0]?.init.headers as Record<string, string>)['X-API-Version']).toBe(
      'v1',
    );
  });

  it('honors a per-request version override', async () => {
    const { client, captured } = clientWith(async () => jsonResponse({}));
    await client.get('/ping', { version: 'v2' });
    expect(captured[0]?.url).toBe('/api/v2/ping');
  });

  it('sends a JSON body with Content-Type and a bearer token', async () => {
    const { client, captured } = clientWith(async () => jsonResponse({ ok: true }), {
      getToken: () => 'tok_123',
    });
    await client.post('/applications', { name: 'x' });
    const headers = captured[0]?.init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.Authorization).toBe('Bearer tok_123');
    expect(captured[0]?.init.body).toBe(JSON.stringify({ name: 'x' }));
  });

  it('omits Authorization when no token is available', async () => {
    const { client, captured } = clientWith(async () => jsonResponse({}), {
      getToken: () => null,
    });
    await client.get('/ping');
    const headers = captured[0]?.init.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('returns undefined for 204 No Content', async () => {
    const { client } = clientWith(
      async () => new Response(null, { status: 204 }),
    );
    await expect(client.delete('/thing')).resolves.toBeUndefined();
  });

  it('supports put and patch verbs', async () => {
    const { client, captured } = clientWith(async () => jsonResponse({}));
    await client.put('/a', { a: 1 });
    await client.patch('/a', { a: 2 });
    expect(captured[0]?.init.method).toBe('PUT');
    expect(captured[1]?.init.method).toBe('PATCH');
  });
});

describe('ApiClient error handling', () => {
  it('maps an error body to a typed ApiError with fields', async () => {
    const { client } = clientWith(async () =>
      jsonResponse(
        {
          error: {
            message: 'Validation failed.',
            fields: [{ field: 'name', message: 'required' }],
          },
          requestId: 'req_9',
        },
        { status: 422 },
      ),
    );
    await expect(client.post('/applications', {})).rejects.toMatchObject({
      kind: 'validation',
      message: 'Validation failed.',
      requestId: 'req_9',
    });
  });

  it('falls back to a status message and header request id', async () => {
    const { client } = clientWith(async () =>
      new Response('', { status: 500, headers: { 'x-request-id': 'hdr_1' } }),
    );
    try {
      await client.get('/x');
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).toMatch(/status 500/);
      expect((err as ApiError).requestId).toBe('hdr_1');
    }
  });

  it('invokes onUnauthorized on a 401', async () => {
    const onUnauthorized = vi.fn();
    const { client } = clientWith(
      async () => jsonResponse({ error: { message: 'nope' } }, { status: 401 }),
      { onUnauthorized },
    );
    await expect(client.get('/secure')).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('handles a non-JSON error body', async () => {
    const { client } = clientWith(
      async () => new Response('plain text failure', { status: 400 }),
    );
    await expect(client.get('/x')).rejects.toMatchObject({ kind: 'unknown' });
  });

  it('wraps a network failure', async () => {
    const { client } = clientWith(async () => {
      throw new TypeError('offline');
    });
    await expect(client.get('/x')).rejects.toMatchObject({ kind: 'network' });
  });

  it('reports a timeout when the request aborts', async () => {
    const { client } = clientWith(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
      { timeoutMs: 5 },
    );
    await expect(client.get('/slow')).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('registers an external abort signal without error', async () => {
    const controller = new AbortController();
    const { client } = clientWith(async () => jsonResponse({}));
    await expect(
      client.get('/x', { signal: controller.signal }),
    ).resolves.toEqual({});
  });
});
