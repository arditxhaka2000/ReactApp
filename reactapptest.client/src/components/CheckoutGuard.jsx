// ProtectedRoute.jsx - Route wrapper that requires authentication
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Checking authentication...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login with the current location
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

// CheckoutGuard.jsx - Component that enforces account creation at checkout
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ShoppingBag } from 'lucide-react';

const CheckoutGuard = ({ cartItems, children }) => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [showAuthPrompt, setShowAuthPrompt] = useState(!isAuthenticated);

    if (!isAuthenticated) {
        return (
            <div className="checkout-auth-guard">
                <div className="auth-prompt-container">
                    <div className="auth-prompt-card">
                        <div className="auth-prompt-header">
                            <div className="prompt-icon">
                                <User size={32} />
                            </div>
                            <h2>Account Required</h2>
                            <p>Create an account or sign in to complete your purchase</p>
                        </div>

                        <div className="cart-summary">
                            <h3>Your Order ({cartItems?.length || 0} item{cartItems?.length !== 1 ? 's' : ''})</h3>
                            <div className="summary-items">
                                {cartItems?.slice(0, 3).map((item, index) => (
                                    <div key={index} className="summary-item">
                                        <img src={item.image} alt={item.name} />
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            <p>Size: {item.size} • Qty: {item.quantity}</p>
                                            <span>£{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                                {cartItems?.length > 3 && (
                                    <p className="more-items">+{cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''}</p>
                                )}
                            </div>
                            <div className="summary-total">
                                <span>Total: £{cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="auth-prompt-actions">
                            <button
                                onClick={() => navigate('/register', { state: { from: '/checkout', cartItems } })}
                                className="create-account-btn"
                            >
                                <User size={20} />
                                Create Account
                            </button>
                            <button
                                onClick={() => navigate('/login', { state: { from: '/checkout', cartItems } })}
                                className="sign-in-btn"
                            >
                                <Lock size={20} />
                                Sign In
                            </button>
                        </div>

                        <div className="security-note">
                            <Lock size={16} />
                            <span>Your information is secure and protected</span>
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="back-to-shopping"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // User is authenticated, show the checkout
    return children;
};