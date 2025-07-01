import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Plus, Edit2, Trash2, Search, Filter, X, Eye, LogOut, Package, Users, ShoppingBag, BarChart3 } from 'lucide-react';
import '../components/AdminPage.css';

const AdminPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, logout, isAdmin, checkAuthStatus } = useAuth();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [collections, setCollections] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Dashboard data
    const [dashboardStats, setDashboardStats] = useState(null);
    const [usersData, setUsersData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        // Force auth check when component mounts
        checkAuthStatus();
    }, []);

    useEffect(() => {
        // Check authentication and admin status
        if (!loading) {
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }

            if (!isAdmin()) {
                console.log('User is not admin:', user);
                navigate('/');
                return;
            }
        }
    }, [loading, isAuthenticated, user, navigate]);

    useEffect(() => {
        if (user && isAdmin()) {
            if (currentView === 'dashboard') {
                loadDashboardStats();
            } else if (currentView === 'products') {
                loadProducts();
                loadCategories();
                loadCollections();
            } else if (currentView === 'users') {
                loadUsersData();
            } else if (currentView === 'orders') {
                loadOrdersData();
            }
        }
    }, [user, currentView]);

    const loadDashboardStats = async () => {
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://localhost:7100/api/adminstats/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDashboardStats(data);
            } else if (response.status === 403) {
                alert('Access denied. Admin privileges required.');
                handleLogout();
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadUsersData = async () => {
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://localhost:7100/api/adminstats/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsersData(data);
            }
        } catch (error) {
            console.error('Failed to load users data:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadOrdersData = async () => {
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://localhost:7100/api/adminstats/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrdersData(data);
            }
        } catch (error) {
            console.error('Failed to load orders data:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://localhost:7100/api/adminstats/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                loadOrdersData(); // Refresh orders data
                alert('Order status updated successfully');
            } else {
                alert('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };

    const loadProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://localhost:7100/api/products/admin', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else if (response.status === 403) {
                alert('Access denied. Admin privileges required.');
                handleLogout();
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://localhost:7100/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadCollections = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://localhost:7100/api/collections', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCollections(data);
            }
        } catch (error) {
            console.error('Failed to load collections:', error);
        }
    };

    const handleLogout = () => {
        logout(); // Use AuthContext logout
        navigate('/login');
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://localhost:7100/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                loadProducts();
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category?.id.toString() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    // Show login form if not authenticated
    if (!isAuthenticated) {
        return <LoginForm onLogin={() => navigate('/login')} />;
    }

    // Show access denied if not admin
    if (!isAdmin()) {
        return <AccessDenied onBack={() => navigate('/')} />;
    }

    return (
        <div className="admin-panel">
            <header className="admin-header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo-section">
                            <Package className="logo" />
                            <h1 className="title">Admin Panel</h1>
                        </div>
                        <div className="user-section">
                            <span className="user-name">Welcome, {user.firstName}</span>
                            <span className="user-role">({user.role})</span>
                            <button onClick={handleLogout} className="logout-btn">
                                <LogOut className="nav-icon" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="admin-layout">
                <nav className="admin-sidebar">
                    <div className="nav-container">
                        <ul className="nav-list">
                            <li className="nav-item">
                                <button
                                    onClick={() => setCurrentView('dashboard')}
                                    className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
                                >
                                    <BarChart3 className="nav-icon" />
                                    <span>Dashboard</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    onClick={() => setCurrentView('products')}
                                    className={`nav-button ${currentView === 'products' ? 'active' : ''}`}
                                >
                                    <Package className="nav-icon" />
                                    <span>Products</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    onClick={() => setCurrentView('orders')}
                                    className={`nav-button ${currentView === 'orders' ? 'active' : ''}`}
                                >
                                    <ShoppingBag className="nav-icon" />
                                    <span>Orders</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    onClick={() => setCurrentView('users')}
                                    className={`nav-button ${currentView === 'users' ? 'active' : ''}`}
                                >
                                    <Users className="nav-icon" />
                                    <span>Users</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>

                <main className="admin-main">
                    {currentView === 'dashboard' && <Dashboard stats={dashboardStats} loading={statsLoading} />}
                    {currentView === 'products' && (
                        <ProductsView
                            products={filteredProducts}
                            categories={categories}
                            collections={collections}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            onEdit={setEditingProduct}
                            onDelete={handleDeleteProduct}
                            onAdd={() => setIsModalOpen(true)}
                        />
                    )}
                    {currentView === 'orders' && <OrdersView orders={ordersData} loading={statsLoading} onUpdateStatus={updateOrderStatus} />}
                    {currentView === 'users' && <UsersView users={usersData} loading={statsLoading} />}
                </main>
            </div>

            {(isModalOpen || editingProduct) && (
                <ProductModal
                    product={editingProduct}
                    categories={categories}
                    collections={collections}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingProduct(null);
                    }}
                    onSave={() => {
                        loadProducts();
                        setIsModalOpen(false);
                        setEditingProduct(null);
                    }}
                />
            )}
        </div>
    );
};

const AccessDenied = ({ onBack }) => (
    <div className="login-container">
        <div className="login-card">
            <div className="login-header">
                <X className="logo" />
                <h2 className="title">Access Denied</h2>
                <p className="subtitle">
                    You don't have administrator privileges to access this page.
                </p>
            </div>
            <button
                onClick={onBack}
                className="submit-btn"
            >
                Back to Home
            </button>
        </div>
    </div>
);

const LoginForm = ({ onLogin }) => (
    <div className="login-container">
        <div className="login-card">
            <div className="login-header">
                <Package className="logo" />
                <h2 className="title">Authentication Required</h2>
                <p className="subtitle">Please log in to access the admin panel</p>
            </div>
            <button
                onClick={onLogin}
                className="submit-btn"
            >
                Go to Login
            </button>
        </div>
    </div>
);

// ... (rest of the components remain the same: Dashboard, ProductsView, ProductModal, OrdersView, UsersView)

const Dashboard = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div>
                <h2 className="dashboard-title">Dashboard</h2>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="dashboard-title">Dashboard</h2>

            {/* Main Stats Cards */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-content">
                        <Package className="card-icon blue" />
                        <div className="card-text">
                            <p className="card-label">Total Products</p>
                            <p className="card-value">{stats.totalProducts}</p>
                            <p className="card-sublabel">{stats.activeProducts} active</p>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card">
                    <div className="card-content">
                        <ShoppingBag className="card-icon green" />
                        <div className="card-text">
                            <p className="card-label">Total Orders</p>
                            <p className="card-value">{stats.totalOrders}</p>
                            <p className="card-sublabel">{stats.pendingOrders} pending</p>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card">
                    <div className="card-content">
                        <Users className="card-icon purple" />
                        <div className="card-text">
                            <p className="card-label">Total Users</p>
                            <p className="card-value">{stats.totalUsers}</p>
                            <p className="card-sublabel">{stats.totalCustomers} customers</p>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card">
                    <div className="card-content">
                        <BarChart3 className="card-icon orange" />
                        <div className="card-text">
                            <p className="card-label">Total Revenue</p>
                            <p className="card-value">${stats.totalRevenue.toFixed(2)}</p>
                            <p className="card-sublabel">${stats.monthlyRevenue.toFixed(2)} this month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="dashboard-section">
                <h3 className="section-title">Recent Activity</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">Recent Orders (30 days)</span>
                        <span className="stat-value">{stats.recentOrdersCount}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Completed Orders</span>
                        <span className="stat-value">{stats.completedOrders}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Low Stock Items</span>
                        <span className="stat-value alert">{stats.lowStockProducts}</span>
                    </div>
                </div>
            </div>

            {/* Top Products */}
            {stats.topProducts && stats.topProducts.length > 0 && (
                <div className="dashboard-section">
                    <h3 className="section-title">Top Selling Products (Last 30 Days)</h3>
                    <div className="top-products-list">
                        {stats.topProducts.map((product, index) => (
                            <div key={product.productId} className="top-product-item">
                                <span className="product-rank">#{index + 1}</span>
                                <div className="product-info">
                                    <span className="product-name">{product.productName}</span>
                                    <span className="product-stats">
                                        {product.totalSold} sold • ${product.revenue.toFixed(2)} revenue
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Orders */}
            {stats.recentOrders && stats.recentOrders.length > 0 && (
                <div className="dashboard-section">
                    <h3 className="section-title">Recent Orders</h3>
                    <div className="recent-orders-table">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.orderNumber}</td>
                                        <td>{order.customerName}</td>
                                        <td>${order.totalAmount.toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProductsView = ({
    products,
    categories,
    collections,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    showFilters,
    setShowFilters,
    onEdit,
    onDelete,
    onAdd
}) => (
    <div>
        <div className="products-header">
            <h2 className="products-title">Products</h2>
            <button onClick={onAdd} className="add-product-btn">
                <Plus className="icon" />
                <span>Add Product</span>
            </button>
        </div>

        <div className="search-filters">
            <div className="main-row">
                <div className="search-container">
                    <div className="search-input-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
                <div className="filter-actions">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="filter-btn"
                    >
                        <Filter className="icon" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="filters-expanded">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label className="filter-label">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="products-table-container">
            <table className="products-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>
                                <div className="product-info">
                                    <img
                                        className="product-image"
                                        src={product.images?.[0]?.imageUrl || '/api/placeholder/40/40'}
                                        alt={product.name}
                                    />
                                    <div className="product-details">
                                        <div className="product-name">{product.name}</div>
                                        <div className="product-brand">{product.brand}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{product.category?.name}</td>
                            <td>
                                <span className="product-price">${product.price}</span>
                                {product.originalPrice && (
                                    <span className="product-original-price">${product.originalPrice}</span>
                                )}
                            </td>
                            <td>{product.inStock ? 'In Stock' : 'Out of Stock'}</td>
                            <td>
                                <span className={`status-badge ${product.inStock ? 'active' : 'inactive'}`}>
                                    {product.inStock ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="action-btn edit"
                                    >
                                        <Edit2 className="icon" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        className="action-btn delete"
                                    >
                                        <Trash2 className="icon" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {products.length === 0 && (
                <div className="empty-state">
                    <Package className="icon" />
                    <h3 className="title">No products</h3>
                    <p className="description">Get started by creating a new product.</p>
                </div>
            )}
        </div>
    </div>
);

const ProductModal = ({ product, categories, collections, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || '',
        originalPrice: product?.originalPrice || '',
        brand: product?.brand || '',
        description: product?.description || '',
        categoryId: product?.category?.id || '',
        collectionId: product?.collection?.id || '',
        color: product?.color || '',
        material: product?.material || '',
        careInstructions: product?.careInstructions || '',
        fit: product?.fit || '',
        inStock: product?.inStock ?? true,
        isFeatured: product?.isFeatured || false,
        isNewArrival: product?.isNewArrival || false,
        isOnSale: product?.isOnSale || false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const url = product ? `https://localhost:7100/api/products/${product.id}` : 'https://localhost:7100/api/products';
            const method = product ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSave();
            } else {
                alert('Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {product ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <button onClick={onClose} className="modal-close">
                            <X className="icon" />
                        </button>
                    </div>

                    <div className="form-container">
                        <div className="form-grid two-columns">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Brand</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Original Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Collection</label>
                                <select
                                    value={formData.collectionId}
                                    onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                                    className="form-select"
                                >
                                    <option value="">Select Collection</option>
                                    {collections.map(collection => (
                                        <option key={collection.id} value={collection.id}>{collection.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-grid three-columns">
                            <div className="form-group">
                                <label className="form-label">Color</label>
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Material</label>
                                <input
                                    type="text"
                                    value={formData.material}
                                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Fit</label>
                                <input
                                    type="text"
                                    value={formData.fit}
                                    onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Care Instructions</label>
                            <input
                                type="text"
                                value={formData.careInstructions}
                                onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div className="form-grid four-columns">
                            <div className="form-checkbox-group">
                                <input
                                    type="checkbox"
                                    id="isNewArrival"
                                    checked={formData.isNewArrival}
                                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                                    className="form-checkbox"
                                />
                                <label htmlFor="isNewArrival" className="form-checkbox-label">
                                    New Arrival
                                </label>
                            </div>

                            <div className="form-checkbox-group">
                                <input
                                    type="checkbox"
                                    id="isOnSale"
                                    checked={formData.isOnSale}
                                    onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                                    className="form-checkbox"
                                />
                                <label htmlFor="isOnSale" className="form-checkbox-label">
                                    On Sale
                                </label>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={onClose}
                                className="form-btn secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="form-btn primary"
                            >
                                {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrdersView = ({ orders, loading, onUpdateStatus }) => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = (orderId, newStatus) => {
        if (confirm(`Are you sure you want to change the order status to ${newStatus}?`)) {
            onUpdateStatus(orderId, newStatus);
        }
    };

    const getStatusOptions = (currentStatus) => {
        const allStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        return allStatuses.filter(status => status !== currentStatus);
    };

    return (
        <div>
            <div className="orders-header">
                <h2 className="orders-title">Orders Management</h2>
                <div className="orders-stats">
                    <span className="stat-badge">Total: {orders.length}</span>
                    <span className="stat-badge pending">
                        Pending: {orders.filter(o => o.status === 'Pending').length}
                    </span>
                    <span className="stat-badge processing">
                        Processing: {orders.filter(o => o.status === 'Processing').length}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="orders-filters">
                <div className="filter-row">
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="order-number-btn"
                                    >
                                        {order.orderNumber}
                                    </button>
                                </td>
                                <td>
                                    <div className="customer-info">
                                        <div className="customer-name">{order.customerName}</div>
                                        <div className="customer-email">{order.customerEmail}</div>
                                    </div>
                                </td>
                                <td>{order.itemCount} items</td>
                                <td className="order-total">${order.totalAmount.toFixed(2)}</td>
                                <td>
                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className="status-select"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Change Status</option>
                                        {getStatusOptions(order.status).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div className="empty-state">
                        <ShoppingBag className="icon" />
                        <h3 className="title">No orders found</h3>
                        <p className="description">No orders match your current filters.</p>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdateStatus={onUpdateStatus}
                />
            )}
        </div>
    );
};

const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-container large">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Order Details - {order.orderNumber}</h3>
                        <button onClick={onClose} className="modal-close">
                            <X className="icon" />
                        </button>
                    </div>

                    <div className="order-details-content">
                        <div className="order-summary">
                            <div className="summary-row">
                                <span className="label">Customer:</span>
                                <span className="value">{order.customerName}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Email:</span>
                                <span className="value">{order.customerEmail}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Order Date:</span>
                                <span className="value">{new Date(order.orderDate).toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Status:</span>
                                <span className={`status-badge ${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Shipping Address:</span>
                                <span className="value">{order.shippingAddress}</span>
                            </div>
                        </div>

                        <div className="order-items">
                            <h4>Order Items</h4>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.productName}</td>
                                            <td>{item.quantity}</td>
                                            <td>${item.unitPrice.toFixed(2)}</td>
                                            <td>${item.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="total-row">
                                        <td colSpan="3"><strong>Total Amount:</strong></td>
                                        <td><strong>${order.totalAmount.toFixed(2)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UsersView = ({ users, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'lastLoginAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const totalCustomers = users.filter(u => u.role === 'Customer').length;
    const totalAdmins = users.filter(u => u.isAdmin || u.role === 'Admin').length;
    const activeUsers = users.filter(u => u.isActive).length;

    return (
        <div>
            <div className="users-header">
                <h2 className="users-title">Users Management</h2>
                <div className="users-stats">
                    <span className="stat-badge">Total: {users.length}</span>
                    <span className="stat-badge customers">Customers: {totalCustomers}</span>
                    <span className="stat-badge admins">Admins: {totalAdmins}</span>
                    <span className="stat-badge active">Active: {activeUsers}</span>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="users-filters">
                <div className="filter-row">
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Roles</option>
                        <option value="Customer">Customer</option>
                        <option value="Admin">Admin</option>
                        <option value="SuperAdmin">Super Admin</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="createdAt">Sort by Join Date</option>
                        <option value="lastLoginAt">Sort by Last Login</option>
                        <option value="firstName">Sort by Name</option>
                        <option value="totalSpent">Sort by Total Spent</option>
                        <option value="orderCount">Sort by Order Count</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="sort-btn"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Orders</th>
                            <th>Total Spent</th>
                            <th>Joined</th>
                            <th>Last Login</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                        </div>
                                        <div className="user-details">
                                            <div className="user-name">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="user-email">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                                        {user.isAdmin ? 'Admin' : user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="user-orders">{user.orderCount}</td>
                                <td className="user-spent">${user.totalSpent.toFixed(2)}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>{new Date(user.lastLoginAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {sortedUsers.length === 0 && (
                    <div className="empty-state">
                        <Users className="icon" />
                        <h3 className="title">No users found</h3>
                        <p className="description">No users match your current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;