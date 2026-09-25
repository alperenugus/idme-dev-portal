/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    // Railway serves the built app via `vite preview` behind its own domain;
    // allow it (Vite 5 host-checks preview by default).
    host: true,
    allowedHosts: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    restoreMocks: true,
    // Node's fetch (undici) rejects relative URLs; give the client an absolute
    // base in tests. MSW matches path-only handlers on any origin.
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/test/**',
        'src/**/index.ts',
        'src/**/types.ts',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
