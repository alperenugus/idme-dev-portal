import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../../store/uiStore';
import { ApiError } from '../../lib/api/errors';
import { applicationsApi } from './api';
import type {
  Application,
  ApplicationWithSecret,
  CreateApplicationInput,
} from './types';

export const applicationKeys = {
  all: ['applications'] as const,
  list: () => [...applicationKeys.all, 'list'] as const,
};

/** Server-state read for the applications list. */
export function useApplications() {
  return useQuery({
    queryKey: applicationKeys.list(),
    queryFn: () => applicationsApi.list(),
  });
}

/**
 * Create-application mutation. On success it seeds the list cache with the new
 * app (minus the secret) and fires a success toast; on failure it surfaces the
 * normalized message. The returned data still carries the one-time secret for
 * the UI to display.
 */
export function useCreateApplication() {
  const queryClient = useQueryClient();
  const notify = useUIStore((s) => s.notify);

  return useMutation<ApplicationWithSecret, ApiError, CreateApplicationInput>({
    mutationFn: (input) => applicationsApi.create(input),
    onSuccess: (created) => {
      const { clientSecret: _secret, ...safe } = created;
      queryClient.setQueryData<Application[]>(applicationKeys.list(), (prev) =>
        prev ? [safe, ...prev] : [safe],
      );
      void queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      notify({
        tone: 'success',
        title: 'Application created',
        message: `“${created.name}” is ready.`,
      });
    },
    onError: (error) => {
      notify({
        tone: 'error',
        title: 'Could not create application',
        message: error.message,
      });
    },
  });
}
