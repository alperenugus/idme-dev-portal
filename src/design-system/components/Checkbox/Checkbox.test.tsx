import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('associates label and description with the input', () => {
    render(
      <Checkbox label="Accept" description="Terms and conditions" readOnly checked />,
    );
    const input = screen.getByRole('checkbox', { name: /Accept/ });
    expect(input).toBeChecked();
    expect(input).toHaveAccessibleDescription('Terms and conditions');
  });

  it('toggles via label click', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Toggle me" onChange={onChange} />);
    await userEvent.click(screen.getByText('Toggle me'));
    expect(onChange).toHaveBeenCalled();
  });
});
