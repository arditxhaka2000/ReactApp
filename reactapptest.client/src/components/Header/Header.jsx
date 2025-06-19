import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ShoppingCart } from 'lucide-react';
import './Header.css';

const Header = () => {
    useEffect(() => {
        const handleScroll = () => {
            const header = document.querySelector('.site-header');
            if (window.scrollY > 70) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className="site-header">
            <div className="container">
                <h1 className="logo"><Link to="/">MyStore</Link></h1>
                <nav className="nav-menu">
                    <Link to="/">Home</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/categories">Categories</Link>
                    <div className="dropdown">
                        <div className="icon-link">
                            <User size={20} />
                            <span style={{ marginLeft: '5px' }}>Account</span>
                        </div>
                        <div className="dropdown-content">
                            <div className="top-row">
                                <Link to="/signin">Sign In </Link>
                                <span> |</span>
                                <Link to="/join">Join</Link>
                            </div>
                            <Link to="/account">
                                <span style={{ marginRight: '8px' }}>👤</span>
                                My Account
                            </Link>
                            <Link to="/orders">
                                <span style={{ marginRight: '8px' }}>📦</span>
                                My Orders
                            </Link>
                            <Link to="/returns">
                                <span style={{ marginRight: '8px' }}>↩️</span>
                                Returns Information
                            </Link>
                            <Link to="/preferences">
                                <span style={{ marginRight: '8px' }}>💬</span>
                                Contact Preferences
                            </Link>
                        </div>
                    </div>
                    <a href="/cart" className="icon-link">
                        <ShoppingCart size={20} />
                        <span style={{ marginLeft: '5px' }}>Cart</span>
                    </a>
                </nav>
            </div>
        </header>
    );
};

export default Header;