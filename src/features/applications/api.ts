import { apiClient } from '../../lib/api/apiClient';
import type {
  Application,
  ApplicationWithSecret,
  CreateApplicationInput,
} from './types';

/** Applications resource — versioned via the shared client (defaults to v1). */
export const applicationsApi = {
  list(): Promise<Application[]> {
    return apiClient.get<Application[]>('/applications');
  },

  create(input: CreateApplicationInput): Promise<ApplicationWithSecret> {
    return apiClient.post<ApplicationWithSecret>('/applications', input);
  },
};
