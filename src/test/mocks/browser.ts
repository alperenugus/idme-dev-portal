import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** MSW worker for the browser — powers the live demo without a real backend. */
export const worker = setupWorker(...handlers);
