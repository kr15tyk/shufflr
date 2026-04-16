import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import App from '../App';

// Provide a fetch mock so useTenantTheme doesn't throw in jsdom.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response('Not Found', { status: 404, statusText: 'Not Found' }),
      ),
    ),
  );
});

// Restore all stubbed globals after each test to prevent leaking into other files.
afterEach(() => {
  vi.unstubAllGlobals();
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
