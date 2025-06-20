import React from 'react';
import './Banner.css'; 

const Banner = ({
    imageUrl = '/Images/Banner_1.jpeg'
}) => {
    return (
        <div className="banner-container" style={{ backgroundImage: `url(${imageUrl})` }}>
            
        </div>
    );
};

export default Banner;
