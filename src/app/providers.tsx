import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, ToastViewport } from '../design-system';
import { createQueryClient } from './queryClient';

/** Composition root for all global providers. */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>{children}</BrowserRouter>
        <ToastViewport />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
