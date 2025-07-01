// UserDashboard.jsx - Main User Dashboard
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, Settings, LogOut, ShoppingBag, Clock, X, Plus, Edit, Trash2 } from 'lucide-react';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch user orders
            const ordersResponse = await fetch('https://localhost:7100/api/users/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                setOrders(ordersData);
            }

            // Fetch wishlist
            const wishlistResponse = await fetch('https://localhost:7100/api/users/wishlist', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (wishlistResponse.ok) {
                const wishlistData = await wishlistResponse.json();
                setWishlist(wishlistData);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#f59e0b';
            case 'processing': return '#3b82f6';
            case 'shipped': return '#8b5cf6';
            case 'delivered': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderOverview = () => (
        <div className="overview-content">
            <div className="welcome-section">
                <h2>Welcome back, {user?.firstName}!</h2>
                <p>Here's what's happening with your account</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{orders.length}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Heart size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{wishlist.length}</h3>
                        <p>Wishlist Items</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{orders.filter(o => o.status === 'Processing').length}</h3>
                        <p>Pending Orders</p>
                    </div>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Recent Orders</h3>
                {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="activity-item">
                        <div className="activity-icon">
                            <Package size={20} />
                        </div>
                        <div className="activity-details">
                            <h4>Order #{order.orderNumber}</h4>
                            <p>{formatDate(order.orderDate)} • £{order.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="activity-status">
                            <span
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                                {order.status}
                            </span>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="empty-state">
                        <ShoppingBag size={48} />
                        <h4>No orders yet</h4>
                        <p>Start shopping to see your orders here</p>
                        <button onClick={() => navigate('/')} className="shop-now-btn">
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="orders-content">
            <h2>My Orders</h2>
            {orders.length > 0 ? (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <h3>Order #{order.orderNumber}</h3>
                                    <p>{formatDate(order.orderDate)}</p>
                                </div>
                                <div className="order-status">
                                    <span
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div className="order-details">
                                <p>{order.itemCount} item(s) • £{order.totalAmount.toFixed(2)}</p>
                                <button
                                    onClick={() => navigate(`/orders/${order.orderNumber}`)}
                                    className="view-order-btn"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <Package size={48} />
                    <h4>No orders found</h4>
                    <p>You haven't placed any orders yet</p>
                    <button onClick={() => navigate('/')} className="shop-now-btn">
                        Start Shopping
                    </button>
                </div>
            )}
        </div>
    );

    const renderWishlist = () => (
        <div className="wishlist-content">
            <h2>My Wishlist</h2>
            {wishlist.length > 0 ? (
                <div className="wishlist-grid">
                    {wishlist.map((item) => (
                        <div key={item.id} className="wishlist-item">
                            <div className="item-image">
                                <img src={item.product.imageUrl} alt={item.product.name} />
                            </div>
                            <div className="item-details">
                                <h4>{item.product.name}</h4>
                                <p className="item-price">£{item.product.price.toFixed(2)}</p>
                                <div className="item-actions">
                                    <button className="add-to-bag-btn">Add to Bag</button>
                                    <button className="remove-btn">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <Heart size={48} />
                    <h4>Your wishlist is empty</h4>
                    <p>Save items you love for later</p>
                    <button onClick={() => navigate('/')} className="shop-now-btn">
                        Browse Products
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-sidebar">
                <div className="user-info">
                    <div className="user-avatar">
                        <User size={32} />
                    </div>
                    <div className="user-details">
                        <h3>{user?.firstName} {user?.lastName}</h3>
                        <p>{user?.email}</p>
                    </div>
                </div>

                <nav className="dashboard-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <User size={20} />
                        Overview
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package size={20} />
                        My Orders
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('wishlist')}
                    >
                        <Heart size={20} />
                        Wishlist
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <Settings size={20} />
                        Profile
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('addresses')}
                    >
                        <MapPin size={20} />
                        Addresses
                    </button>
                </nav>

                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>

            <div className="dashboard-main">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'wishlist' && renderWishlist()}
                {activeTab === 'profile' && <UserProfile />}
                {activeTab === 'addresses' && <UserAddresses />}
            </div>
        </div>
    );
};

// UserProfile.jsx - Profile Management Component
const UserProfile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth || '',
        gender: user?.gender || ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        const result = await updateProfile(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } else {
            setErrors({ submit: result.message });
        }
        setLoading(false);
    };

    return (
        <div className="profile-content">
            <h2>Profile Settings</h2>
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            className={errors.firstName ? 'error' : ''}
                        />
                        {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            className={errors.lastName ? 'error' : ''}
                        />
                        {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => handleChange('phoneNumber', e.target.value)}
                            className={errors.phoneNumber ? 'error' : ''}
                        />
                        {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                    </div>

                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <select
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                    >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                </div>

                {success && (
                    <div className="success-message">
                        Profile updated successfully!
                    </div>
                )}

                {errors.submit && (
                    <div className="submit-error">{errors.submit}</div>
                )}

                <button type="submit" disabled={loading} className="save-btn">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

// UserAddresses.jsx - Address Management Component
const UserAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United Kingdom',
        addressType: 'Home',
        isDefault: false
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://localhost:7100/api/users/addresses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.addressLine1) newErrors.addressLine1 = 'Address line 1 is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
        if (!formData.country) newErrors.country = 'Country is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://localhost:7100/api/users/addresses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchAddresses(); // Refresh the list
                setShowAddForm(false);
                setFormData({
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'United Kingdom',
                    addressType: 'Home',
                    isDefault: false
                });
            } else {
                setErrors({ submit: 'Failed to save address' });
            }
        } catch (error) {
            setErrors({ submit: 'Error saving address' });
        } finally {
            setSaving(false);
        }
    };

    const deleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`https://localhost:7100/api/users/addresses/${addressId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchAddresses(); // Refresh the list
            }
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    return (
        <div className="addresses-content">
            <div className="addresses-header">
                <h2>My Addresses</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="add-address-btn"
                >
                    <Plus size={16} />
                    Add New Address
                </button>
            </div>

            {showAddForm && (
                <div className="add-address-form">
                    <div className="form-header">
                        <h3>Add New Address</h3>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="close-form-btn"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Address Type</label>
                                <select
                                    value={formData.addressType}
                                    onChange={(e) => handleInputChange('addressType', e.target.value)}
                                >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Address Line 1 *</label>
                                <input
                                    type="text"
                                    value={formData.addressLine1}
                                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                                    className={errors.addressLine1 ? 'error' : ''}
                                    placeholder="123 Main Street"
                                />
                                {errors.addressLine1 && <span className="error-text">{errors.addressLine1}</span>}
                            </div>

                            <div className="form-group">
                                <label>Address Line 2</label>
                                <input
                                    type="text"
                                    value={formData.addressLine2}
                                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                                    placeholder="Apartment, suite, etc."
                                />
                            </div>

                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className={errors.city ? 'error' : ''}
                                    placeholder="London"
                                />
                                {errors.city && <span className="error-text">{errors.city}</span>}
                            </div>

                            <div className="form-group">
                                <label>State/County</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    placeholder="Greater London"
                                />
                            </div>

                            <div className="form-group">
                                <label>Postal Code *</label>
                                <input
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                    className={errors.postalCode ? 'error' : ''}
                                    placeholder="SW1A 1AA"
                                />
                                {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
                            </div>

                            <div className="form-group">
                                <label>Country *</label>
                                <select
                                    value={formData.country}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                >
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Ireland">Ireland</option>
                                    <option value="France">France</option>
                                    <option value="Germany">Germany</option>
                                </select>
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                                    />
                                    Set as default address
                                </label>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="submit-error">{errors.submit}</div>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="save-btn"
                            >
                                {saving ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading-spinner"></div>
            ) : addresses.length > 0 ? (
                <div className="addresses-grid">
                    {addresses.map((address) => (
                        <div key={address.id} className="address-card">
                            <div className="address-header">
                                <h4>{address.addressType || 'Address'}</h4>
                                {address.isDefault && (
                                    <span className="default-badge">Default</span>
                                )}
                            </div>
                            <div className="address-details">
                                <p>{address.addressLine1}</p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                <p>{address.city}, {address.state}</p>
                                <p>{address.postalCode}</p>
                                <p>{address.country}</p>
                            </div>
                            <div className="address-actions">
                                <button className="edit-btn">
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteAddress(address.id)}
                                    className="delete-btn"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <MapPin size={48} />
                    <h4>No addresses saved</h4>
                    <p>Add an address for faster checkout</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="empty-state-btn"
                    >
                        Add Your First Address
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;