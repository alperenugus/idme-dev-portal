import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders with default rows and accepts input', async () => {
    render(<Textarea aria-label="notes" />);
    const el = screen.getByLabelText('notes');
    expect(el).toHaveAttribute('rows', '3');
    await userEvent.type(el, 'abc');
    expect(el).toHaveValue('abc');
  });

  it('marks itself invalid', () => {
    render(<Textarea aria-label="notes" invalid />);
    expect(screen.getByLabelText('notes')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
