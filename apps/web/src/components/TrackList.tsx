import React from 'react';

interface SimpleTrack {
  id: string;
  title: string;
}

interface TrackListProps {
  tracks: SimpleTrack[];
}

function TrackList({ tracks }: TrackListProps): React.JSX.Element {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tracks.map((track, index) => (
        <li
          key={track.id}
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '0.5rem',
            background: '#f5f5f5',
            borderRadius: 4,
          }}
          aria-label={`Track ${index + 1}: ${track.title}`}
        >
          {index + 1}. {track.title}
        </li>
      ))}
    </ul>
  );
}

export default TrackList;
