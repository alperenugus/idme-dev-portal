import { describe, expect, it } from 'vitest';
import { ApiError, kindFromStatus } from './errors';

describe('kindFromStatus', () => {
  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [409, 'conflict'],
    [422, 'validation'],
    [429, 'rate_limited'],
    [500, 'server'],
    [503, 'server'],
    [418, 'unknown'],
  ])('maps %i to %s', (status, kind) => {
    expect(kindFromStatus(status)).toBe(kind);
  });
});

describe('ApiError', () => {
  it('defaults fieldErrors to an empty array and carries metadata', () => {
    const err = new ApiError({ kind: 'server', message: 'boom', status: 500 });
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('boom');
    expect(err.fieldErrors).toEqual([]);
    expect(err.status).toBe(500);
  });

  it('retains field errors, requestId, and cause', () => {
    const cause = new Error('root');
    const err = new ApiError({
      kind: 'validation',
      message: 'bad',
      fieldErrors: [{ field: 'name', message: 'required' }],
      requestId: 'req_1',
      cause,
    });
    expect(err.fieldErrors).toHaveLength(1);
    expect(err.requestId).toBe('req_1');
    expect(err.cause).toBe(cause);
  });

  it('flags retryable kinds', () => {
    expect(new ApiError({ kind: 'network', message: '' }).isRetryable).toBe(true);
    expect(new ApiError({ kind: 'timeout', message: '' }).isRetryable).toBe(true);
    expect(new ApiError({ kind: 'server', message: '' }).isRetryable).toBe(true);
    expect(
      new ApiError({ kind: 'rate_limited', message: '' }).isRetryable,
    ).toBe(true);
    expect(
      new ApiError({ kind: 'validation', message: '' }).isRetryable,
    ).toBe(false);
  });
});
