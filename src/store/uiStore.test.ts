import { describe, expect, it, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => useUIStore.setState({ toasts: [] }));

  it('adds a toast with defaults and returns its id', () => {
    const id = useUIStore.getState().notify({ tone: 'success', title: 'Saved' });
    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.id).toBe(id);
    expect(toasts[0]?.duration).toBe(5000);
  });

  it('replaces a toast reusing the same id', () => {
    const notify = useUIStore.getState().notify;
    notify({ id: 'x', tone: 'info', title: 'First' });
    notify({ id: 'x', tone: 'info', title: 'Second' });
    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.title).toBe('Second');
  });

  it('dismisses a toast by id', () => {
    const id = useUIStore.getState().notify({ tone: 'error', title: 'Oops' });
    useUIStore.getState().dismiss(id);
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });

  it('clears all toasts', () => {
    const { notify, clearToasts } = useUIStore.getState();
    notify({ tone: 'info', title: 'a' });
    notify({ tone: 'info', title: 'b' });
    clearToasts();
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });
});
