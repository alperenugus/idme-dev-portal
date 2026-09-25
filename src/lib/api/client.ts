import {
  buildVersionedPath,
  DEFAULT_API_VERSION,
  getApiBaseUrl,
  type ApiVersion,
} from './config';
import { ApiError, kindFromStatus, type FieldError } from './errors';

export interface RequestOptions {
  /** Override the client's default API version for this call. */
  version?: ApiVersion;
  /** JSON-serializable request body. */
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Per-request timeout override (ms). */
  timeoutMs?: number;
}

export interface ApiClientOptions {
  baseUrl?: string;
  defaultVersion?: ApiVersion;
  /** Auth interceptor — returns a bearer token to attach, or null to skip. */
  getToken?: () => string | null | Promise<string | null>;
  /** Called whenever a request returns 401, so auth state can react (logout). */
  onUnauthorized?: () => void;
  /** Injectable fetch (tests / SSR). Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

interface ErrorBody {
  error?: { message?: string; fields?: FieldError[] };
  message?: string;
  requestId?: string;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultVersion: ApiVersion;
  private readonly getToken?: ApiClientOptions['getToken'];
  private readonly onUnauthorized?: () => void;
  private readonly fetchImpl?: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? getApiBaseUrl();
    this.defaultVersion = options.defaultVersion ?? DEFAULT_API_VERSION;
    this.getToken = options.getToken;
    this.onUnauthorized = options.onUnauthorized;
    // Kept as an option, not captured here: the global fetch must be resolved
    // per-request so test mocks (MSW) that patch globalThis.fetch after this
    // singleton is constructed are still honored.
    this.fetchImpl = options.fetchImpl;
    this.timeoutMs = options.timeoutMs ?? 15000;
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, { ...options, body });
  }
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, { ...options, body });
  }
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, { ...options, body });
  }
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const version = options.version ?? this.defaultVersion;
    const url = this.baseUrl + buildVersionedPath(version, path);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-API-Version': version,
      ...options.headers,
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken ? await this.getToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? this.timeoutMs,
    );
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort(), {
        once: true,
      });
    }

    const doFetch = this.fetchImpl ?? globalThis.fetch.bind(globalThis);

    let response: Response;
    try {
      response = await doFetch(url, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
    } catch (cause) {
      const aborted = controller.signal.aborted;
      throw new ApiError({
        kind: aborted ? 'timeout' : 'network',
        message: aborted
          ? 'The request timed out. Check your connection and try again.'
          : 'Network error — could not reach the server.',
        cause,
      });
    } finally {
      window.clearTimeout(timeout);
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const requestId = response.headers.get('x-request-id') ?? undefined;

    if (response.status === 204) {
      return undefined as T;
    }

    let payload: unknown = undefined;
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (response.ok) {
      return payload as T;
    }

    if (response.status === 401) {
      this.onUnauthorized?.();
    }

    const body = (typeof payload === 'object' ? payload : null) as ErrorBody | null;
    const message =
      body?.error?.message ??
      body?.message ??
      `Request failed with status ${response.status}.`;

    throw new ApiError({
      status: response.status,
      kind: kindFromStatus(response.status),
      message,
      fieldErrors: body?.error?.fields ?? [],
      requestId: body?.requestId ?? requestId,
    });
  }
}
