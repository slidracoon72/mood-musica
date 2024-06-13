import React, { useState, useEffect } from 'react';
import './style.css'; // Import your CSS file for styling

const Animation = () => {
  const [word, setWord] = useState('Discover music to match your mood!');
  const [displayedChars, setDisplayedChars] = useState('');
  const [isRetracting, setIsRetracting] = useState(false);

  useEffect(() => {
    let timeout;
    if (!isRetracting) {
      timeout = setTimeout(() => {
        setDisplayedChars(prevChars => {
          const nextChar = word[prevChars.length];
          return prevChars + nextChar;
        });
      }, 100); // Adjust this timeout for speed of character addition
    } else {
      timeout = setTimeout(() => {
        setDisplayedChars(prevChars => prevChars.slice(0, -1));
      }, 100); // Adjust this timeout for speed of character retraction
    }

    if (displayedChars === word) {
      setIsRetracting(true);
    } else if (displayedChars === '') {
      setIsRetracting(false);
    }

    return () => clearTimeout(timeout);
  }, [displayedChars, word, isRetracting]);

  return (
    <div className="container">
      <div className="animated-text">{displayedChars}</div>
    </div>
  );
};

export default Animation;
