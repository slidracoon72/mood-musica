import React from 'react';
import '../App.css';

const Description = () => {
    return (
        <div className='description'>
            <h3>Are you ready to embark on a musical journey that perfectly matches your mood? With Mood-Musica,
                you can discover songs tailored to your emotions in just a few clicks!
            </h3>
            <h2>How does it work?</h2>
            <ol>
                <li><span className='ds'><strong>Start Emotion Detection:</strong></span> Click the button above to activate our state-of-the-art facial emotion detection system.</li>
                <li><span className='ds'><strong>Feel the Music:</strong></span> Using advanced AI and your webcam, Mood-Musica analyzes your facial expressions to determine your current mood.</li>
                <li><span className='ds'><strong>Get Recommendations:</strong></span> Based on your detected emotion, we curate a personalized playlist from Spotify just for you!</li>
            </ol>
            <p>Whether you're feeling happy, sad, excited, or anything in between, Mood-Musica is here to provide the perfect soundtrack for your day.
                Dive into the world of music that's all about you. Ready to get started? Hit the button and let the music play!
            </p>
        </div>
    )
}

export default Description;