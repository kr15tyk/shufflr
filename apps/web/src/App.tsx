import React, { useState, useEffect } from 'react';

import { shuffle } from '@shufflr/utils';

import TrackList from './components/TrackList';
import { TenantProvider, useTenant } from './context/TenantContext';
import { BrandingPage } from './pages/BrandingPage';

const sampleTracks = [
  { id: '1', title: 'Track One' },
  { id: '2', title: 'Track Two' },
  { id: '3', title: 'Track Three' },
  { id: '4', title: 'Track Four' },
  { id: '5', title: 'Track Five' },
];

/** Minimal path-based page router – avoids adding a router library. */
function usePage(): string {
  const [page, setPage] = useState(() => window.location.pathname);

  // Listen for programmatic navigation (pushState / replaceState not used here,
  // but we handle the popstate event for browser back/forward support).
  useEffect(() => {
    const onPop = () => setPage(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return page;
}

function navigate(path: string): void {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** Header shown on every page. */
function AppHeader(): React.JSX.Element {
  const { org } = useTenant();

  return (
    <header
      style={{
        background: 'var(--color-primary, #4F46E5)',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {org?.theme.logoUrl && (
          <img
            src={org.theme.logoUrl}
            alt={`${org.name} logo`}
            style={{ height: 32, width: 'auto', borderRadius: 4 }}
          />
        )}
        <span
          style={{
            color: '#fff',
            fontFamily: 'var(--font-heading, sans-serif)',
            fontWeight: 700,
            fontSize: '1.2rem',
          }}
        >
          {org ? org.name : '🔀 Shufflr'}
        </span>
      </div>
      <nav style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => navigate('/')} style={navBtnStyle}>
          Home
        </button>
        <button onClick={() => navigate('/branding')} style={navBtnStyle}>
          Branding
        </button>
      </nav>
    </header>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '0.35rem 0.75rem',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

/** Main track-shuffling page. */
function HomePage(): React.JSX.Element {
  const [tracks, setTracks] = useState(sampleTracks);

  const handleShuffle = (): void => {
    setTracks(shuffle(tracks));
  };

  return (
    <main
      style={{
        fontFamily: 'var(--font-body, sans-serif)',
        maxWidth: 600,
        margin: '2rem auto',
        padding: '0 1rem',
        color: 'var(--color-text, #111827)',
      }}
    >
      <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)' }}>🔀 Shufflr</h1>
      <button
        onClick={handleShuffle}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          background: 'var(--color-primary, #4F46E5)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
        }}
      >
        Shuffle Tracks
      </button>
      <TrackList tracks={tracks} />
    </main>
  );
}

/** Root content – picks page based on current pathname. */
function AppContent(): React.JSX.Element {
  const page = usePage();
  const isBranding = page === '/branding' || page.startsWith('/branding/');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface, #fff)' }}>
      <AppHeader />
      {isBranding ? <BrandingPage /> : <HomePage />}
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <TenantProvider>
      <AppContent />
    </TenantProvider>
  );
}

export default App;
