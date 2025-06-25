// LoginRegisterPage.jsx - Combined Login/Register Page
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, ArrowLeft, ShoppingBag } from 'lucide-react';
import './LoginRegisterPage.css';

const LoginRegisterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Get redirect path and cart items from location state
    const redirectTo = location.state?.from || '/';
    const cartItems = location.state?.cartItems || [];

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // Register form state
    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        password: '',
        confirmPassword: ''
    });

    const handleLoginChange = (field, value) => {
        setLoginData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleRegisterChange = (field, value) => {
        setRegisterData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateLoginForm = () => {
        const newErrors = {};

        if (!loginData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!loginData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRegisterForm = () => {
        const newErrors = {};

        if (!registerData.firstName) newErrors.firstName = 'First name is required';
        if (!registerData.lastName) newErrors.lastName = 'Last name is required';

        if (!registerData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!registerData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!registerData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

        if (!registerData.password) {
            newErrors.password = 'Password is required';
        } else if (registerData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (registerData.password !== registerData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        if (!validateLoginForm()) return;

        setLoading(true);
        const result = await login(loginData.email, loginData.password);

        if (result.success) {
            // If coming from checkout with cart items, navigate to checkout with items
            if (redirectTo === '/checkout' && cartItems.length > 0) {
                navigate('/checkout', { state: { cartItems } });
            } else {
                navigate(redirectTo);
            }
        } else {
            setErrors({ submit: result.message });
        }
        setLoading(false);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (!validateRegisterForm()) return;

        setLoading(true);
        const result = await register(registerData);

        if (result.success) {
            // If coming from checkout with cart items, navigate to checkout with items
            if (redirectTo === '/checkout' && cartItems.length > 0) {
                navigate('/checkout', { state: { cartItems } });
            } else {
                navigate(redirectTo);
            }
        } else {
            setErrors({ submit: result.message });
        }
        setLoading(false);
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    return (
        <div className="auth-page-container">
            <div className="auth-page-content">
                {/* Left Side - Branding/Info */}
                <div className="auth-page-left">
                    <div className="auth-branding">
                        <div className="brand-icon">
                            <ShoppingBag size={48} />
                        </div>
                        <h2>Welcome to Our Store</h2>
                        <p>Join thousands of happy customers who trust us for their shopping needs.</p>

                        <div className="auth-features">
                            <div className="feature-item">
                                <div className="feature-icon">✨</div>
                                <div>
                                    <h4>Exclusive Deals</h4>
                                    <p>Get access to member-only discounts and early sales</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🚚</div>
                                <div>
                                    <h4>Fast Delivery</h4>
                                    <p>Free shipping on orders over £50</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🔒</div>
                                <div>
                                    <h4>Secure Shopping</h4>
                                    <p>Your data is protected with industry-standard security</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Auth Forms */}
                <div className="auth-page-right">
                    <div className="auth-form-container">
                        <div className="auth-form-header">
                            <button onClick={() => navigate(-1)} className="back-button">
                                <ArrowLeft size={20} />
                            </button>

                            <div className="auth-tabs">
                                <button
                                    className={`auth-tab ${isLogin ? 'active' : ''}`}
                                    onClick={() => setIsLogin(true)}
                                >
                                    Sign In
                                </button>
                                <button
                                    className={`auth-tab ${!isLogin ? 'active' : ''}`}
                                    onClick={() => setIsLogin(false)}
                                >
                                    Create Account
                                </button>
                            </div>
                        </div>

                        {/* Cart Summary (if coming from checkout) */}
                        {cartItems.length > 0 && (
                            <div className="checkout-reminder">
                                <h4>Complete your purchase</h4>
                                <p>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} waiting in your cart</p>
                                <div className="cart-preview">
                                    {cartItems.slice(0, 2).map((item, index) => (
                                        <div key={index} className="cart-preview-item">
                                            <img src={item.image} alt={item.name} />
                                            <span>{item.name}</span>
                                        </div>
                                    ))}
                                    {cartItems.length > 2 && (
                                        <span className="more-items">+{cartItems.length - 2} more</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Login Form */}
                        {isLogin ? (
                            <form onSubmit={handleLoginSubmit} className="auth-form">
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-with-icon">
                                        <Mail className="input-icon" size={20} />
                                        <input
                                            type="email"
                                            value={loginData.email}
                                            onChange={(e) => handleLoginChange('email', e.target.value)}
                                            className={errors.email ? 'error' : ''}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="input-with-icon">
                                        <Lock className="input-icon" size={20} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={loginData.password}
                                            onChange={(e) => handleLoginChange('password', e.target.value)}
                                            className={errors.password ? 'error' : ''}
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <span className="error-text">{errors.password}</span>}
                                </div>

                                <div className="form-options">
                                    <button type="button" className="forgot-password">
                                        Forgot Password?
                                    </button>
                                </div>

                                {errors.submit && (
                                    <div className="submit-error">{errors.submit}</div>
                                )}

                                <button type="submit" disabled={loading} className="auth-submit-btn">
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>
                        ) : (
                            /* Register Form */
                            <form onSubmit={handleRegisterSubmit} className="auth-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <div className="input-with-icon">
                                            <User className="input-icon" size={20} />
                                            <input
                                                type="text"
                                                value={registerData.firstName}
                                                onChange={(e) => handleRegisterChange('firstName', e.target.value)}
                                                className={errors.firstName ? 'error' : ''}
                                                placeholder="First name"
                                            />
                                        </div>
                                        {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <div className="input-with-icon">
                                            <User className="input-icon" size={20} />
                                            <input
                                                type="text"
                                                value={registerData.lastName}
                                                onChange={(e) => handleRegisterChange('lastName', e.target.value)}
                                                className={errors.lastName ? 'error' : ''}
                                                placeholder="Last name"
                                            />
                                        </div>
                                        {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-with-icon">
                                        <Mail className="input-icon" size={20} />
                                        <input
                                            type="email"
                                            value={registerData.email}
                                            onChange={(e) => handleRegisterChange('email', e.target.value)}
                                            className={errors.email ? 'error' : ''}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <div className="input-with-icon">
                                            <Phone className="input-icon" size={20} />
                                            <input
                                                type="tel"
                                                value={registerData.phoneNumber}
                                                onChange={(e) => handleRegisterChange('phoneNumber', e.target.value)}
                                                className={errors.phoneNumber ? 'error' : ''}
                                                placeholder="+44 7000 000000"
                                            />
                                        </div>
                                        {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <div className="input-with-icon">
                                            <Calendar className="input-icon" size={20} />
                                            <input
                                                type="date"
                                                value={registerData.dateOfBirth}
                                                onChange={(e) => handleRegisterChange('dateOfBirth', e.target.value)}
                                                className={errors.dateOfBirth ? 'error' : ''}
                                            />
                                        </div>
                                        {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Gender (Optional)</label>
                                    <select
                                        value={registerData.gender}
                                        onChange={(e) => handleRegisterChange('gender', e.target.value)}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="input-with-icon">
                                        <Lock className="input-icon" size={20} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={registerData.password}
                                            onChange={(e) => handleRegisterChange('password', e.target.value)}
                                            className={errors.password ? 'error' : ''}
                                            placeholder="Create password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <span className="error-text">{errors.password}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <div className="input-with-icon">
                                        <Lock className="input-icon" size={20} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={registerData.confirmPassword}
                                            onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                                            className={errors.confirmPassword ? 'error' : ''}
                                            placeholder="Confirm password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                                </div>

                                {errors.submit && (
                                    <div className="submit-error">{errors.submit}</div>
                                )}

                                <button type="submit" disabled={loading} className="auth-submit-btn">
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                        )}

                        <div className="auth-switch">
                            <p>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button onClick={switchMode} className="switch-btn">
                                    {isLogin ? 'Create Account' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginRegisterPage;