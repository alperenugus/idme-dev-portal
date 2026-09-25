import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../design-system/theme/ThemeProvider';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  queryClient?: QueryClient;
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { queryClient, route = '/', ...options }: WrapperOptions & RenderOptions = {},
) {
  const client = queryClient ?? createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return {
    user: userEvent.setup(),
    queryClient: client,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

export * from '@testing-library/react';
