import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyField } from './CopyField';

describe('CopyField', () => {
  it('shows a non-secret value and copies it', async () => {
    const onCopy = vi.fn().mockResolvedValue(undefined);
    render(<CopyField label="Client ID" value="idme_123" onCopy={onCopy} />);
    expect(screen.getByText('idme_123')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Copy Client ID' }));
    expect(onCopy).toHaveBeenCalledWith('idme_123');
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it('masks a secret until revealed, then hides again', async () => {
    render(<CopyField label="Secret" value="supersecret" secret onCopy={vi.fn()} />);
    expect(screen.queryByText('supersecret')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reveal Secret' }));
    expect(screen.getByText('supersecret')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Hide Secret' }));
    expect(screen.queryByText('supersecret')).not.toBeInTheDocument();
  });

  it('surfaces an error when copying fails', async () => {
    const onCopy = vi.fn().mockRejectedValue(new Error('denied'));
    render(<CopyField label="Token" value="abc" onCopy={onCopy} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy Token' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Couldn/);
  });

  it('uses the Clipboard API by default when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyField label="Client ID" value="idme_xyz" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy Client ID' }));
    expect(writeText).toHaveBeenCalledWith('idme_xyz');
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it('errors when the Clipboard API is unavailable', async () => {
    Object.assign(navigator, { clipboard: undefined });
    render(<CopyField label="Client ID" value="idme_xyz" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy Client ID' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
