import { create } from 'zustand';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
  /** Auto-dismiss delay in ms. 0 disables auto-dismiss. */
  duration: number;
}

export type ToastInput = Omit<Toast, 'id' | 'duration'> & {
  id?: string;
  duration?: number;
};

interface UIState {
  toasts: Toast[];
  /** Push a toast; returns its id so callers can dismiss it programmatically. */
  notify: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  clearToasts: () => void;
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `toast-${counter}`;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  notify: (toast) => {
    const id = toast.id ?? nextId();
    const entry: Toast = {
      id,
      tone: toast.tone,
      title: toast.title,
      message: toast.message,
      duration: toast.duration ?? 5000,
    };
    set((state) => ({
      toasts: [...state.toasts.filter((t) => t.id !== id), entry],
    }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));
