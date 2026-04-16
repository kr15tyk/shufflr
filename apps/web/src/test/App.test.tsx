import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import App from '../App';

// Provide a minimal fetch mock so useTenantTheme doesn't throw in jsdom.
beforeEach(() => {
  vi.stubGlobal('fetch', () => Promise.resolve({ ok: false, status: 404, statusText: 'Not Found', text: () => Promise.resolve('Not Found') }));
});

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    // "Shufflr" now appears in the header and in the page h1 – use getAllByText.
    const headings = screen.getAllByText(/shufflr/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders the shuffle button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /shuffle tracks/i })).toBeInTheDocument();
  });
});
