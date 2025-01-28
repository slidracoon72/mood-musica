import React from 'react';

const TopTracks = ({ tracks }) => {
  return (
    <div>
      <h2>Your Top Tracks</h2>
      <ul>
        {tracks.map((track, index) => (
          <li key={index}>
            {track.name} by {track.artists.map(artist => artist.name).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopTracks;
