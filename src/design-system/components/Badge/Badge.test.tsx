import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge tone="success">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies a class for the given tone', () => {
    const { container } = render(<Badge tone="danger">Bad</Badge>);
    expect(container.firstElementChild?.className).toBeTruthy();
  });
});
