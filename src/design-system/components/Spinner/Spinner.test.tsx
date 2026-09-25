import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('exposes a status role with an accessible label by default', () => {
    render(<Spinner label="Loading data" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Loading data',
    );
  });

  it('hides from a11y tree when aria-hidden', () => {
    render(<Spinner aria-hidden />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
