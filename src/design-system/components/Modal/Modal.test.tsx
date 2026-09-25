import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

function setup(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = vi.fn();
  render(
    <Modal open title="Confirm" description="Are you sure?" onClose={onClose} {...props}>
      <p>Body content</p>
    </Modal>,
  );
  return { onClose };
}

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} title="Hidden" onClose={vi.fn()}>
        x
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a labelled dialog with content', () => {
    setup();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Confirm');
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('closes on Escape and backdrop click when dismissible', async () => {
    const { onClose } = setup();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('does not close on Escape/backdrop when not dismissible', async () => {
    const { onClose } = setup({ dismissible: false });
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders a footer when provided', () => {
    setup({ footer: <button>OK</button> });
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });
});
