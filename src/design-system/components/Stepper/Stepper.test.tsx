import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';

const steps = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
];

describe('Stepper', () => {
  it('marks the active step with aria-current', () => {
    render(<Stepper steps={steps} activeIndex={1} />);
    const current = screen.getByText('Beta').closest('li');
    expect(current).toHaveAttribute('aria-current', 'step');
  });

  it('renders a check for completed steps and numbers upcoming ones', () => {
    render(<Stepper steps={steps} activeIndex={2} />);
    // Step 3 (index 2) is current, shows "3"; steps 1 & 2 are complete (checks).
    expect(screen.getByText('3')).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Progress' });
    expect(list.querySelectorAll('svg').length).toBe(2);
  });
});
