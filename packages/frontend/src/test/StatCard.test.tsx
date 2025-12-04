import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../components/StatCard';

describe('StatCard', () => {
  it('should render value and label', () => {
    render(<StatCard value={42} label="Total Items" />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total Items')).toBeInTheDocument();
  });

  it('should handle string values', () => {
    render(<StatCard value="N/A" label="Status" />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
