import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('accepts typing', async () => {
    render(<Input aria-label="field" />);
    await userEvent.type(screen.getByLabelText('field'), 'hello');
    expect(screen.getByLabelText('field')).toHaveValue('hello');
  });

  it('marks itself invalid via aria-invalid', () => {
    render(<Input aria-label="field" invalid />);
    expect(screen.getByLabelText('field')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
