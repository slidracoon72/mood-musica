import React from 'react';

const SongSuggestionCard = ({ song }) => (
  <div className="suggestion-card">
    <div className='card-heading'>
      <h2>{song.suggestion_text}</h2>
    </div>
    <h3>
      <span className="song-name">{song.name} </span>
      {song.artists && song.artists.length > 0 && (
        <span className="artist">by {song.artists.join(', ')}</span>
      )}
    </h3>
    {song.thumbnail_url && (
      <a href={song.spotify_url} target="_blank" rel="noopener noreferrer" className="thumbnail-wrapper">
        <img src={song.thumbnail_url} alt={song.name} style={{ width: '150px', borderRadius: '10px' }} />
        <i className="fas fa-play play-icon"></i>
      </a>
    )}
    {song.preview_url ? (
      <>
        <p>SONG PREVIEW</p>
        <audio controls>
          <source src={song.preview_url} type="audio/mpeg" />
        </audio>
      </>
    ) : (
      <p>No Preview Available</p>
    )}
    <p>Click the thumbnail to play the full song on Spotify!</p>
  </div>
);

export default SongSuggestionCard;
