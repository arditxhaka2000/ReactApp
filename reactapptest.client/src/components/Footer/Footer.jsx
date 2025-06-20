import React from 'react';
import './Footer.css';

const Footer = () => (
    <footer className="site-footer">
        <div className="footer-container">
            <div className="footer-column">
                <h4>Information</h4>
                <a href="/account">My Account</a>
                <a href="/help">Help & Contact</a>
                <a href="/rewards">Rewards</a>
                <a href="/size-guide">Size Guide</a>
                <a href="/delivery">Delivery Info</a>
                <a href="/returns">Returns</a>
            </div>
            <div className="footer-column">
                <h4>About Us</h4>
                <a href="/about">About Us</a>
                <a href="/careers">Careers</a>
                <a href="/sustainability">Sustainability</a>
            </div>
            <div className="footer-column">
                <h4>T&C's</h4>
                <a href="/terms">Terms & Conditions</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="/track-order">Track My Order</a>
            </div>
            <div className="footer-column newsletter">
                <h4>Stay in the loop</h4>
                <p>Sign up for early access, exclusive offers & more</p>
                <form className="newsletter-form">
                    <input type="email" placeholder="Enter your email" />
                    <button type="submit">Subscribe</button>
                </form>
            </div>
        </div>
        <div className="footer-bottom">
            <div className="social-icons">
                {/* Replace with your icons */}
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-facebook"></i></a>
                <a href="#"><i className="fab fa-pinterest"></i></a>
                <a href="#"><i className="fab fa-tiktok"></i></a>
            </div>
            <p>© {new Date().getFullYear()}My App Ltd. All rights reserved.</p>
        </div>
    </footer>
);

export default Footer;
