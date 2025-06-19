import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container">
                <p>© {new Date().getFullYear()} MyStore. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
