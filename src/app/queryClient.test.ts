import { describe, expect, it } from 'vitest';
import { createQueryClient } from './queryClient';
import { ApiError } from '../lib/api/errors';

type RetryFn = (failureCount: number, error: unknown) => boolean;

describe('createQueryClient retry policy', () => {
  const client = createQueryClient();
  const retry = client.getDefaultOptions().queries?.retry as RetryFn;

  it('never retries non-retryable ApiErrors', () => {
    const err = new ApiError({ kind: 'validation', message: 'bad' });
    expect(retry(0, err)).toBe(false);
  });

  it('retries transient errors up to twice', () => {
    const err = new ApiError({ kind: 'server', message: 'boom' });
    expect(retry(0, err)).toBe(true);
    expect(retry(1, err)).toBe(true);
    expect(retry(2, err)).toBe(false);
  });

  it('retries unknown (non-Api) errors within the limit', () => {
    expect(retry(0, new Error('weird'))).toBe(true);
  });

  it('disables mutation retries', () => {
    expect(client.getDefaultOptions().mutations?.retry).toBe(false);
  });
});
