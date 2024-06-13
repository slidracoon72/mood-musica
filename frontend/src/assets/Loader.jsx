import React from 'react';
import { Audio } from 'react-loader-spinner';
import '../App.css';

const Loader = () => {
    return (
        <div className='loader-container'>
            <Audio
                height="80"
                width="80"
                radius="9"
                color="#ff865c"
                ariaLabel="three-dots-loading"
                wrapperStyle
                wrapperClass
            />
        </div>
    );
};

export default Loader;


