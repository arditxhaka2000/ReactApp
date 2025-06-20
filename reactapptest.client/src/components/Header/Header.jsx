import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const isMainPage = location.pathname === '/';
    useEffect(() => {
        if (!isMainPage) return;

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
    }, [isMainPage]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className={`${isMainPage ? 'site-header' : 'site-headerMain'} ${isMenuOpen || (!isMainPage && isScrolled) ? 'scrolled' : ''}`}>

            <div className="container">
                <h1 className="logo"><Link to="/">MyStore</Link></h1>

                {/* Hamburger Menu Button */}
                <button className="hamburger-btn" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Navigation */}
                <nav className="nav-menu desktop-nav">
                    <Link to="/">Home</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/category">Categories</Link>
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

                {/* Mobile Navigation */}
                <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-nav-content">
                        <Link to="/" onClick={closeMenu}>Home</Link>
                        <Link to="/products" onClick={closeMenu}>Products</Link>
                        <Link to="/categories" onClick={closeMenu}>Categories</Link>

                        <div className="mobile-account-section">
                            <div className="mobile-auth-links">
                                <Link to="/signin" onClick={closeMenu}>Sign In</Link>
                                <span>|</span>
                                <Link to="/join" onClick={closeMenu}>Join</Link>
                            </div>
                            <Link to="/account" onClick={closeMenu}>
                                <span style={{ marginRight: '8px' }}>👤</span>
                                My Account
                            </Link>
                            <Link to="/orders" onClick={closeMenu}>
                                <span style={{ marginRight: '8px' }}>📦</span>
                                My Orders
                            </Link>
                            <Link to="/returns" onClick={closeMenu}>
                                <span style={{ marginRight: '8px' }}>↩️</span>
                                Returns Information
                            </Link>
                            <Link to="/preferences" onClick={closeMenu}>
                                <span style={{ marginRight: '8px' }}>💬</span>
                                Contact Preferences
                            </Link>
                        </div>

                        <Link to="/cart" className="mobile-cart-link" onClick={closeMenu}>
                            <ShoppingCart size={20} />
                            <span>Cart</span>
                        </Link>
                    </div>
                </nav>

                {/* Mobile Overlay */}
                {isMenuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}
            </div>
        </header>
    );
};

export default Header;