// Fixed Checkout.jsx - Remove the incorrect exports
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext'; // Adjust path as needed
import { ArrowLeft, CreditCard, Lock, Truck, MapPin, User, Mail, Phone, Gift } from 'lucide-react';
import './Checkout.css';

// CheckoutGuard component - moved to this file since it's checkout-specific
const CheckoutGuard = ({ cartItems, children }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

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

    return children;
};

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Get cart items from navigation state or redirect if none
    const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Pre-fill form with user data
    const [customerInfo, setCustomerInfo] = useState({
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || ''
    });

    const [billingAddress, setBillingAddress] = useState({
        address1: '',
        address2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'United Kingdom'
    });

    const [shippingAddress, setShippingAddress] = useState({
        address1: '',
        address2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'United Kingdom'
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardName: ''
    });

    const [formOptions, setFormOptions] = useState({
        sameAsBilling: true,
        newsletter: false
    });

    const [shippingOption, setShippingOption] = useState('standard');
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [errors, setErrors] = useState({});

    // Redirect if no cart items
    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            navigate('/');
        }
    }, [cartItems, navigate]);

    // Shipping options
    const shippingOptions = [
        { id: 'standard', name: 'Standard Delivery', time: '3-5 working days', price: 3.99 },
        { id: 'express', name: 'Express Delivery', time: '1-2 working days', price: 5.99 },
        { id: 'next', name: 'Next Day Delivery', time: 'Next working day', price: 9.99 }
    ];

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedShipping = shippingOptions.find(opt => opt.id === shippingOption);
    const shippingCost = subtotal >= 50 ? 0 : selectedShipping.price;
    const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount / 100) : 0;
    const total = subtotal + shippingCost - promoDiscount;

    // Form handlers
    const handleCustomerInfoChange = (field, value) => {
        setCustomerInfo(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleBillingAddressChange = (field, value) => {
        setBillingAddress(prev => ({ ...prev, [field]: value }));
        if (errors[`billing_${field}`]) {
            setErrors(prev => ({ ...prev, [`billing_${field}`]: null }));
        }
    };

    const handleShippingAddressChange = (field, value) => {
        setShippingAddress(prev => ({ ...prev, [field]: value }));
        if (errors[`shipping_${field}`]) {
            setErrors(prev => ({ ...prev, [`shipping_${field}`]: null }));
        }
    };

    const handlePaymentInfoChange = (field, value) => {
        // Format card number and expiry date
        if (field === 'cardNumber') {
            value = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
            if (value.length > 19) value = value.substring(0, 19);
        } else if (field === 'expiryDate') {
            value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            if (value.length > 5) value = value.substring(0, 5);
        } else if (field === 'cvv') {
            value = value.replace(/\D/g, '');
            if (value.length > 3) value = value.substring(0, 3);
        }

        setPaymentInfo(prev => ({ ...prev, [field]: value }));
        if (errors[`payment_${field}`]) {
            setErrors(prev => ({ ...prev, [`payment_${field}`]: null }));
        }
    };

    const handleSameAsBillingChange = (checked) => {
        setFormOptions(prev => ({ ...prev, sameAsBilling: checked }));
        if (checked) {
            setShippingAddress({ ...billingAddress });
        }
    };

    // Promo code handler
    const applyPromoCode = async () => {
        if (!promoCode.trim()) return;

        try {
            const response = await fetch('https://localhost:7100/api/orders/validate-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode, subtotal })
            });

            if (response.ok) {
                const promo = await response.json();
                setAppliedPromo(promo);
                setErrors(prev => ({ ...prev, promo: null }));
            } else {
                setErrors(prev => ({ ...prev, promo: 'Invalid promo code' }));
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, promo: 'Error validating promo code' }));
        }
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        // Customer info validation (already pre-filled, but still validate)
        if (!customerInfo.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) newErrors.email = 'Invalid email format';

        if (!customerInfo.firstName) newErrors.firstName = 'First name is required';
        if (!customerInfo.lastName) newErrors.lastName = 'Last name is required';
        if (!customerInfo.phone) newErrors.phone = 'Phone number is required';

        // Billing address validation
        if (!billingAddress.address1) newErrors.billing_address1 = 'Address is required';
        if (!billingAddress.city) newErrors.billing_city = 'City is required';
        if (!billingAddress.postcode) newErrors.billing_postcode = 'Postcode is required';

        // Shipping address validation (if different from billing)
        if (!formOptions.sameAsBilling) {
            if (!shippingAddress.address1) newErrors.shipping_address1 = 'Address is required';
            if (!shippingAddress.city) newErrors.shipping_city = 'City is required';
            if (!shippingAddress.postcode) newErrors.shipping_postcode = 'Postcode is required';
        }

        // Payment validation
        if (!paymentInfo.cardNumber) newErrors.payment_cardNumber = 'Card number is required';
        else if (paymentInfo.cardNumber.replace(/\s/g, '').length < 16) newErrors.payment_cardNumber = 'Invalid card number';

        if (!paymentInfo.expiryDate) newErrors.payment_expiryDate = 'Expiry date is required';
        if (!paymentInfo.cvv) newErrors.payment_cvv = 'CVV is required';
        if (!paymentInfo.cardName) newErrors.payment_cardName = 'Cardholder name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Order submission with authentication
    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const orderData = {
                customerInfo,
                billingAddress,
                shippingAddress: formOptions.sameAsBilling ? billingAddress : shippingAddress,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    sizeId: parseInt(item.size),
                    quantity: item.quantity,
                    price: item.price
                })),
                shipping: {
                    option: shippingOption,
                    cost: shippingCost
                },
                promoCode: appliedPromo?.code || '',
                total,
                newsletter: formOptions.newsletter,
                notes: ''
            };

            const response = await fetch('https://localhost:7100/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const result = await response.json();
                setOrderId(result.orderId);
                setOrderComplete(true);
            } else {
                const errorData = await response.json();
                setErrors({ submit: errorData.message || 'Failed to place order' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="checkout-container">
                <div className="order-success">
                    <div className="success-icon">✓</div>
                    <h1>Order Confirmed!</h1>
                    <p>Your order #{orderId} has been successfully placed.</p>
                    <p>You'll receive a confirmation email shortly.</p>
                    <div className="success-actions">
                        <button onClick={() => navigate('/')} className="continue-shopping-btn">
                            Continue Shopping
                        </button>
                        <button onClick={() => navigate(`/orders/${orderId}`)} className="view-order-btn">
                            View Order
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <CheckoutGuard cartItems={cartItems}>
            <div className="checkout-container">
                <div className="checkout-header">
                    <button onClick={() => navigate(-1)} className="back-button">
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <h1>Checkout</h1>
                    <div className="security-badge">
                        <Lock size={16} />
                        Secure Checkout
                    </div>
                </div>

                <div className="checkout-grid">
                    <div className="checkout-form">
                        {/* Customer Information - Pre-filled */}
                        <section className="checkout-section">
                            <h2>
                                <User size={20} />
                                Contact Information
                            </h2>
                            <div className="user-info-display">
                                <p>Logged in as: <strong>{user?.firstName} {user?.lastName}</strong></p>
                                <p>Email: <strong>{user?.email}</strong></p>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={customerInfo.phone}
                                        onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                                        className={errors.phone ? 'error' : ''}
                                        placeholder="+44 7000 000000"
                                    />
                                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                                </div>
                            </div>
                        </section>

                        {/* Billing Address */}
                        <section className="checkout-section">
                            <h2>
                                <MapPin size={20} />
                                Billing Address
                            </h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Address Line 1 *</label>
                                    <input
                                        type="text"
                                        value={billingAddress.address1}
                                        onChange={(e) => handleBillingAddressChange('address1', e.target.value)}
                                        className={errors.billing_address1 ? 'error' : ''}
                                        placeholder="123 Main Street"
                                    />
                                    {errors.billing_address1 && <span className="error-text">{errors.billing_address1}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Address Line 2</label>
                                    <input
                                        type="text"
                                        value={billingAddress.address2}
                                        onChange={(e) => handleBillingAddressChange('address2', e.target.value)}
                                        placeholder="Apartment, suite, etc."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        value={billingAddress.city}
                                        onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                                        className={errors.billing_city ? 'error' : ''}
                                        placeholder="London"
                                    />
                                    {errors.billing_city && <span className="error-text">{errors.billing_city}</span>}
                                </div>
                                <div className="form-group">
                                    <label>County</label>
                                    <input
                                        type="text"
                                        value={billingAddress.county}
                                        onChange={(e) => handleBillingAddressChange('county', e.target.value)}
                                        placeholder="Greater London"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Postcode *</label>
                                    <input
                                        type="text"
                                        value={billingAddress.postcode}
                                        onChange={(e) => handleBillingAddressChange('postcode', e.target.value)}
                                        className={errors.billing_postcode ? 'error' : ''}
                                        placeholder="SW1A 1AA"
                                    />
                                    {errors.billing_postcode && <span className="error-text">{errors.billing_postcode}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Country *</label>
                                    <select
                                        value={billingAddress.country}
                                        onChange={(e) => handleBillingAddressChange('country', e.target.value)}
                                    >
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Ireland">Ireland</option>
                                        <option value="France">France</option>
                                        <option value="Germany">Germany</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Shipping Address */}
                        <section className="checkout-section">
                            <h2>
                                <Truck size={20} />
                                Shipping Address
                            </h2>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formOptions.sameAsBilling}
                                        onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                                    />
                                    Same as billing address
                                </label>
                            </div>

                            {!formOptions.sameAsBilling && (
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Address Line 1 *</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.address1}
                                            onChange={(e) => handleShippingAddressChange('address1', e.target.value)}
                                            className={errors.shipping_address1 ? 'error' : ''}
                                            placeholder="123 Main Street"
                                        />
                                        {errors.shipping_address1 && <span className="error-text">{errors.shipping_address1}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Address Line 2</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.address2}
                                            onChange={(e) => handleShippingAddressChange('address2', e.target.value)}
                                            placeholder="Apartment, suite, etc."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.city}
                                            onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                                            className={errors.shipping_city ? 'error' : ''}
                                            placeholder="London"
                                        />
                                        {errors.shipping_city && <span className="error-text">{errors.shipping_city}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>County</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.county}
                                            onChange={(e) => handleShippingAddressChange('county', e.target.value)}
                                            placeholder="Greater London"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Postcode *</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.postcode}
                                            onChange={(e) => handleShippingAddressChange('postcode', e.target.value)}
                                            className={errors.shipping_postcode ? 'error' : ''}
                                            placeholder="SW1A 1AA"
                                        />
                                        {errors.shipping_postcode && <span className="error-text">{errors.shipping_postcode}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Country *</label>
                                        <select
                                            value={shippingAddress.country}
                                            onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                                        >
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Ireland">Ireland</option>
                                            <option value="France">France</option>
                                            <option value="Germany">Germany</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Shipping Options */}
                        <section className="checkout-section">
                            <h2>
                                <Truck size={20} />
                                Shipping Options
                            </h2>
                            <div className="shipping-options">
                                {shippingOptions.map((option) => (
                                    <label key={option.id} className="shipping-option">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value={option.id}
                                            checked={shippingOption === option.id}
                                            onChange={(e) => setShippingOption(e.target.value)}
                                        />
                                        <div className="option-details">
                                            <div className="option-info">
                                                <span className="option-name">{option.name}</span>
                                                <span className="option-time">{option.time}</span>
                                            </div>
                                            <div className="option-price">
                                                {subtotal >= 50 ? 'Free' : `£${option.price.toFixed(2)}`}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {subtotal < 50 && (
                                <div className="free-shipping-notice">
                                    <Gift size={16} />
                                    Spend £{(50 - subtotal).toFixed(2)} more for free shipping!
                                </div>
                            )}
                        </section>

                        {/* Payment Information */}
                        <section className="checkout-section">
                            <h2>
                                <CreditCard size={20} />
                                Payment Information
                            </h2>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Card Number *</label>
                                    <input
                                        type="text"
                                        value={paymentInfo.cardNumber}
                                        onChange={(e) => handlePaymentInfoChange('cardNumber', e.target.value)}
                                        className={errors.payment_cardNumber ? 'error' : ''}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength="19"
                                    />
                                    {errors.payment_cardNumber && <span className="error-text">{errors.payment_cardNumber}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Expiry Date *</label>
                                    <input
                                        type="text"
                                        value={paymentInfo.expiryDate}
                                        onChange={(e) => handlePaymentInfoChange('expiryDate', e.target.value)}
                                        className={errors.payment_expiryDate ? 'error' : ''}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                    />
                                    {errors.payment_expiryDate && <span className="error-text">{errors.payment_expiryDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>CVV *</label>
                                    <input
                                        type="text"
                                        value={paymentInfo.cvv}
                                        onChange={(e) => handlePaymentInfoChange('cvv', e.target.value)}
                                        className={errors.payment_cvv ? 'error' : ''}
                                        placeholder="123"
                                        maxLength="3"
                                    />
                                    {errors.payment_cvv && <span className="error-text">{errors.payment_cvv}</span>}
                                </div>
                                <div className="form-group full-width">
                                    <label>Cardholder Name *</label>
                                    <input
                                        type="text"
                                        value={paymentInfo.cardName}
                                        onChange={(e) => handlePaymentInfoChange('cardName', e.target.value)}
                                        className={errors.payment_cardName ? 'error' : ''}
                                        placeholder="John Smith"
                                    />
                                    {errors.payment_cardName && <span className="error-text">{errors.payment_cardName}</span>}
                                </div>
                            </div>
                        </section>

                        {/* Promo Code */}
                        <section className="checkout-section">
                            <h2>
                                <Gift size={20} />
                                Promo Code
                            </h2>
                            <div className="promo-code-group">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Enter promo code"
                                    className={errors.promo ? 'error' : ''}
                                />
                                <button
                                    type="button"
                                    onClick={applyPromoCode}
                                    className="apply-promo-btn"
                                    disabled={!promoCode.trim()}
                                >
                                    Apply
                                </button>
                            </div>
                            {errors.promo && <span className="error-text">{errors.promo}</span>}
                            {appliedPromo && (
                                <div className="applied-promo">
                                    <span>✓ {appliedPromo.code} applied ({appliedPromo.discount}% off)</span>
                                </div>
                            )}
                        </section>

                        {/* Newsletter */}
                        <section className="checkout-section">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formOptions.newsletter}
                                        onChange={(e) => setFormOptions(prev => ({ ...prev, newsletter: e.target.checked }))}
                                    />
                                    Subscribe to our newsletter for exclusive offers and updates
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h2>Order Summary</h2>

                        <div className="order-items">
                            {cartItems.map((item, index) => (
                                <div key={index} className="order-item">
                                    <img src={item.image} alt={item.name} />
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        {item.color && <p>Color: {item.color}</p>}
                                        <p>Size: {item.size}</p>
                                        <p>Qty: {item.quantity}</p>
                                    </div>
                                    <div className="item-price">
                                        £{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Totals */}
                        <div className="order-totals">
                            <div className="total-line">
                                <span>Subtotal:</span>
                                <span>£{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="total-line">
                                <span>Shipping:</span>
                                <span>{shippingCost === 0 ? 'Free' : `£${shippingCost.toFixed(2)}`}</span>
                            </div>
                            {promoDiscount > 0 && (
                                <div className="total-line discount">
                                    <span>Discount:</span>
                                    <span>-£{promoDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="total-line final-total">
                                <span>Total:</span>
                                <span>£{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="submit-error">{errors.submit}</div>
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="place-order-btn"
                        >
                            {loading ? 'Processing...' : `Place Order - £${total.toFixed(2)}`}
                        </button>

                        <div className="security-info">
                            <Lock size={16} />
                            Your payment information is secure and encrypted
                        </div>
                    </div>
                </div>
            </div>
        </CheckoutGuard>
    );
};

export default Checkout;