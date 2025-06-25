import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Add this import
import { User, ShoppingCart, Menu, X, Package, Heart, Settings, LogOut } from 'lucide-react'; // Add more icons
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0); // Add cart count
    const [wishlistCount, setWishlistCount] = useState(0); // Add wishlist count

    const location = useLocation();
    const navigate = useNavigate(); // Add navigate
    const { user, isAuthenticated, logout } = useAuth(); // Add authentication

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

    // Load user data when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            loadUserCounts();
        } else {
            loadGuestCart();
        }
    }, [isAuthenticated, user]);

    const loadUserCounts = async () => {
        try {
            // Load cart count from localStorage
            const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItemCount(savedCart.reduce((total, item) => total + item.quantity, 0));

            // Load wishlist count from API
            const token = localStorage.getItem('authToken');
            if (token) {
                const wishlistResponse = await fetch('https://localhost:7100/api/users/wishlist', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (wishlistResponse.ok) {
                    const wishlistData = await wishlistResponse.json();
                    setWishlistCount(wishlistData.length);
                }
            }
        } catch (error) {
            console.error('Error loading user counts:', error);
        }
    };

    const loadGuestCart = () => {
        try {
            const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItemCount(savedCart.reduce((total, item) => total + item.quantity, 0));
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        setWishlistCount(0);
        navigate('/');
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

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

                    {/* Updated User Dropdown */}
                    <div className="dropdown">
                        <div className="icon-link">
                            {isAuthenticated ? (
                                <>
                                    <div className="user-avatar">
                                        {getInitials(user?.firstName, user?.lastName)}
                                    </div>
                                    <div className="user-info-compact">
                                        <div className="user-name-compact">{user?.firstName}</div>
                                        <div className="user-status">Online</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <User size={20} />
                                    <span style={{ marginLeft: '5px' }}>Account</span>
                                </>
                            )}
                        </div>

                        <div className="user-dropdown-content">
                            {isAuthenticated ? (
                                <>
                                    {/* Authenticated User Header */}
                                    <div className="dropdown-user-header">
                                        <div className="dropdown-user-avatar">
                                            {getInitials(user?.firstName, user?.lastName)}
                                        </div>
                                        <div className="dropdown-user-details">
                                            <div className="dropdown-user-name">
                                                {user?.firstName} {user?.lastName}
                                            </div>
                                            <div className="dropdown-user-email">{user?.email}</div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="dropdown-stats">
                                        <div className="stat-item">
                                            <div className="stat-number">{wishlistCount}</div>
                                            <div className="stat-label">Wishlist</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-number">{cartItemCount}</div>
                                            <div className="stat-label">Cart</div>
                                        </div>
                                    </div>

                                    {/* Main Actions */}
                                    <div className="dropdown-section">
                                        <Link to="/dashboard" className="dropdown-item">
                                            <User size={18} />
                                            <span>Dashboard</span>
                                        </Link>

                                        <Link to="/dashboard?tab=orders" className="dropdown-item">
                                            <Package size={18} />
                                            <span>My Orders</span>
                                        </Link>

                                        <Link to="/dashboard?tab=wishlist" className="dropdown-item">
                                            <Heart size={18} />
                                            <span>Wishlist</span>
                                            {wishlistCount > 0 && (
                                                <span className="dropdown-badge">{wishlistCount}</span>
                                            )}
                                        </Link>
                                    </div>

                                    {/* Settings */}
                                    <div className="dropdown-section">
                                        <Link to="/dashboard?tab=profile" className="dropdown-item">
                                            <Settings size={18} />
                                            <span>Account Settings</span>
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="dropdown-section">
                                        <button onClick={handleLogout} className="dropdown-item danger" style={{
                                            background: 'none',
                                            border: 'none',
                                            width: '100%',
                                            textAlign: 'left',
                                            cursor: 'pointer'
                                        }}>
                                            <LogOut size={18} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Guest User - Keep your original structure */}
                                    <div className="dropdown-guest-header">
                                        <div className="dropdown-guest-text">Welcome! Sign in to access your account</div>
                                    </div>

                                    <div className="dropdown-section">
                                        <div className="top-row">
                                            <Link to="/login">Sign In </Link>
                                            <span> |</span>
                                            <Link to="/register">Join</Link>
                                        </div>
                                    </div>

                                    <div className="dropdown-section">
                                        <Link to="/account" className="dropdown-item">
                                            <span style={{ marginRight: '8px' }}>👤</span>
                                            My Account
                                        </Link>
                                        <Link to="/orders" className="dropdown-item">
                                            <span style={{ marginRight: '8px' }}>📦</span>
                                            My Orders
                                        </Link>
                                        <Link to="/returns" className="dropdown-item">
                                            <span style={{ marginRight: '8px' }}>↩️</span>
                                            Returns Information
                                        </Link>
                                        <Link to="/preferences" className="dropdown-item">
                                            <span style={{ marginRight: '8px' }}>💬</span>
                                            Contact Preferences
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Cart with counter */}
                    <Link to="/cart" className="icon-link" style={{ position: 'relative' }}>
                        <ShoppingCart size={20} />
                        <span style={{ marginLeft: '5px' }}>Cart</span>
                        {cartItemCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#dc2626',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                padding: '2px 6px',
                                borderRadius: '50%',
                                minWidth: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: '1'
                            }}>
                                {cartItemCount}
                            </span>
                        )}
                    </Link>
                </nav>

                {/* Mobile Navigation - Enhanced */}
                <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-nav-content">
                        <Link to="/" onClick={closeMenu}>Home</Link>
                        <Link to="/products" onClick={closeMenu}>Products</Link>
                        <Link to="/category" onClick={closeMenu}>Categories</Link>

                        {/* Enhanced Mobile Account Section */}
                        <div className="mobile-account-section">
                            {isAuthenticated ? (
                                <>
                                    <div className="mobile-user-header">
                                        <div className="mobile-user-avatar">
                                            {getInitials(user?.firstName, user?.lastName)}
                                        </div>
                                        <div className="mobile-user-info">
                                            <div className="mobile-user-name">
                                                {user?.firstName} {user?.lastName}
                                            </div>
                                            <div className="mobile-user-email">{user?.email}</div>
                                        </div>
                                    </div>

                                    <Link to="/dashboard" onClick={closeMenu}>
                                        <User size={18} style={{ marginRight: '8px' }} />
                                        Dashboard
                                    </Link>
                                    <Link to="/dashboard?tab=orders" onClick={closeMenu}>
                                        <Package size={18} style={{ marginRight: '8px' }} />
                                        My Orders
                                    </Link>
                                    <Link to="/dashboard?tab=wishlist" onClick={closeMenu}>
                                        <Heart size={18} style={{ marginRight: '8px' }} />
                                        Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                                    </Link>
                                    <Link to="/dashboard?tab=profile" onClick={closeMenu}>
                                        <Settings size={18} style={{ marginRight: '8px' }} />
                                        Account Settings
                                    </Link>

                                    <button onClick={handleLogout} style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#dc2626',
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '10px 0',
                                        fontSize: '0.95rem',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <LogOut size={18} style={{ marginRight: '8px' }} />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Keep your original mobile auth links */}
                                    <div className="mobile-auth-links">
                                        <Link to="/login" onClick={closeMenu}>Sign In</Link>
                                        <span>|</span>
                                        <Link to="/register" onClick={closeMenu}>Join</Link>
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
                                </>
                            )}
                        </div>

                        {/* Cart with counter */}
                        <Link to="/cart" className="mobile-cart-link" onClick={closeMenu}>
                            <ShoppingCart size={20} />
                            <span>Cart {cartItemCount > 0 && `(${cartItemCount})`}</span>
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