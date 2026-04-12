import React, { useState } from 'react';

import { shuffle } from '@shufflr/utils';

import TrackList from './components/TrackList';

const sampleTracks = [
  { id: '1', title: 'Track One' },
  { id: '2', title: 'Track Two' },
  { id: '3', title: 'Track Three' },
  { id: '4', title: 'Track Four' },
  { id: '5', title: 'Track Five' },
];

function App(): React.JSX.Element {
  const [tracks, setTracks] = useState(sampleTracks);

  const handleShuffle = (): void => {
    setTracks(shuffle(tracks));
  };

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>🔀 Shufflr</h1>
      <button onClick={handleShuffle} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Shuffle Tracks
      </button>
      <TrackList tracks={tracks} />
    </main>
  );
}

export default App;
