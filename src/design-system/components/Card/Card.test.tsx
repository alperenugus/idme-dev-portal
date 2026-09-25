import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders title, description, body, and footer', () => {
    render(
      <Card title="Heading" description="Sub" footer={<span>Footer</span>}>
        <p>Body</p>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Heading' })).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('omits the header when no title/description are given', () => {
    render(<Card>Just body</Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
