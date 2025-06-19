import React from 'react';
import './Banner.css'; 

const Banner = ({
    imageUrl = '/Images/Banner_1.jpeg',
    title = 'Default Banner Title',
    description = 'This is the banner description.',
    buttonText,
    buttonLink
}) => {
    return (
        <div className="banner-container" style={{ backgroundImage: `url(${imageUrl})` }}>
            
        </div>
    );
};

export default Banner;
