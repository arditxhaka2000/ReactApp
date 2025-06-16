import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="site-header">
            <div className="container">
                <h1 className="logo"><Link to="/">MyStore</Link></h1>
                <nav className="nav-menu">
                    <Link to="/">Home</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/categories">Categories</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
