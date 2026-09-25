/**
 * Normalized API error taxonomy. Every failure that leaves the client is an
 * `ApiError`, so UI code branches on a stable `kind` instead of guessing from
 * status codes or fetch rejections.
 */

export type ApiErrorKind =
  | 'network' // request never reached / got a response
  | 'timeout'
  | 'unauthorized' // 401
  | 'forbidden' // 403
  | 'not_found' // 404
  | 'conflict' // 409
  | 'validation' // 422
  | 'rate_limited' // 429
  | 'server' // 5xx
  | 'unknown';

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorOptions {
  status?: number;
  kind: ApiErrorKind;
  message: string;
  fieldErrors?: FieldError[];
  requestId?: string;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly status?: number;
  readonly kind: ApiErrorKind;
  readonly fieldErrors: FieldError[];
  readonly requestId?: string;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.kind = options.kind;
    this.fieldErrors = options.fieldErrors ?? [];
    this.requestId = options.requestId;
    if (options.cause !== undefined) this.cause = options.cause;
  }

  /** True for transient failures that are safe to retry. */
  get isRetryable(): boolean {
    return (
      this.kind === 'network' ||
      this.kind === 'timeout' ||
      this.kind === 'server' ||
      this.kind === 'rate_limited'
    );
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  switch (status) {
    case 401:
      return 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'not_found';
    case 409:
      return 'conflict';
    case 422:
      return 'validation';
    case 429:
      return 'rate_limited';
    default:
      if (status >= 500) return 'server';
      return 'unknown';
  }
}
