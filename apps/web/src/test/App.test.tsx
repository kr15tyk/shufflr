import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import App from '../App';

// Provide a minimal fetch mock so useTenantTheme doesn't throw in jsdom.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        redirected: false,
        type: 'default' as ResponseType,
        url: '',
        text: () => Promise.resolve('Not Found'),
        json: () => Promise.reject(new Error('not ok')),
        clone: () => ({}),
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
      } as unknown as Response),
    ),
  );
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
