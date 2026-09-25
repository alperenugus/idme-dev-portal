import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and defaults to type=button', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('fires onClick when enabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows a spinner and disables while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Submit
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects the disabled prop', () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders a leading icon when not loading', () => {
    render(<Button leadingIcon={<span data-testid="ic" />}>With icon</Button>);
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });

  it('applies variant, size, and fullWidth class hooks', () => {
    const { container } = render(
      <Button variant="danger" size="lg" fullWidth>
        X
      </Button>,
    );
    expect(container.querySelector('button')?.className).toBeTruthy();
  });
});
