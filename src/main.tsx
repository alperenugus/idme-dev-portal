import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './design-system/tokens.css';

/**
 * There is no real backend for this reference build, so the Mock Service Worker
 * powers the API in every environment (dev + the deployed demo). Swap this out
 * for a real API by setting VITE_API_BASE_URL and removing this bootstrap.
 */
async function enableMocking(): Promise<void> {
  const { worker } = await import('./test/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}

enableMocking().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
