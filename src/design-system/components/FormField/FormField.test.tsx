import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';
import { Input } from '../Input/Input';

describe('FormField', () => {
  it('wires label, hint, and control ids together', () => {
    render(
      <FormField label="Email" hint="We never share it" required>
        {(control) => <Input {...control} />}
      </FormField>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAccessibleDescription('We never share it');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('shows an error (replacing the hint) and marks the control invalid', () => {
    render(
      <FormField label="Email" hint="hint text" error="Required">
        {(control) => <Input {...control} />}
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(screen.queryByText('hint text')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
