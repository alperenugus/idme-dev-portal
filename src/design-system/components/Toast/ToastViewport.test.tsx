import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastViewport } from './ToastViewport';
import { useUIStore } from '../../../store/uiStore';

describe('ToastViewport', () => {
  beforeEach(() => useUIStore.setState({ toasts: [] }));

  it('renders active toasts with title and message', () => {
    act(() => {
      useUIStore.getState().notify({
        tone: 'success',
        title: 'Done',
        message: 'All good',
        duration: 0,
      });
    });
    render(<ToastViewport />);
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('dismisses a toast on close click', async () => {
    act(() => {
      useUIStore.getState().notify({ tone: 'info', title: 'Hi', duration: 0 });
    });
    render(<ToastViewport />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    );
    expect(screen.queryByText('Hi')).not.toBeInTheDocument();
  });

  it('auto-dismisses after its duration', async () => {
    render(<ToastViewport />);
    act(() => {
      useUIStore.getState().notify({ tone: 'info', title: 'Temp', duration: 30 });
    });
    expect(screen.getByText('Temp')).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 60));
    expect(screen.queryByText('Temp')).not.toBeInTheDocument();
  });
});
