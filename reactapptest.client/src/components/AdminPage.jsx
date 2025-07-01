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
        if (user && isAdmin() && currentView === 'products') {
            loadProducts();
            loadCategories();
            loadCollections();
        }
    }, [user, currentView]);

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
            const response = await fetch('https://localhost:7100/api/category', {
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
                    {currentView === 'dashboard' && <Dashboard />}
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
                    {currentView === 'orders' && <OrdersView />}
                    {currentView === 'users' && <UsersView />}
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

const Dashboard = () => (
    <div>
        <h2 className="dashboard-title">Dashboard</h2>
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <div className="card-content">
                    <Package className="card-icon blue" />
                    <div className="card-text">
                        <p className="card-label">Total Products</p>
                        <p className="card-value">0</p>
                    </div>
                </div>
            </div>
            <div className="dashboard-card">
                <div className="card-content">
                    <ShoppingBag className="card-icon green" />
                    <div className="card-text">
                        <p className="card-label">Total Orders</p>
                        <p className="card-value">0</p>
                    </div>
                </div>
            </div>
            <div className="dashboard-card">
                <div className="card-content">
                    <Users className="card-icon purple" />
                    <div className="card-text">
                        <p className="card-label">Total Users</p>
                        <p className="card-value">0</p>
                    </div>
                </div>
            </div>
            <div className="dashboard-card">
                <div className="card-content">
                    <BarChart3 className="card-icon orange" />
                    <div className="card-text">
                        <p className="card-label">Revenue</p>
                        <p className="card-value">$0</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

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
                                    id="inStock"
                                    checked={formData.inStock}
                                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                    className="form-checkbox"
                                />
                                <label htmlFor="inStock" className="form-checkbox-label">
                                    In Stock
                                </label>
                            </div>

                            <div className="form-checkbox-group">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    className="form-checkbox"
                                />
                                <label htmlFor="isFeatured" className="form-checkbox-label">
                                    Featured
                                </label>
                            </div>

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

const OrdersView = () => (
    <div>
        <h2 className="dashboard-title">Orders</h2>
        <div className="placeholder-content">
            <ShoppingBag className="icon" />
            <h3 className="title">Orders Management</h3>
            <p className="description">Order management functionality coming soon.</p>
        </div>
    </div>
);

const UsersView = () => (
    <div>
        <h2 className="dashboard-title">Users</h2>
        <div className="placeholder-content">
            <Users className="icon" />
            <h3 className="title">User Management</h3>
            <p className="description">User management functionality coming soon.</p>
        </div>
    </div>
);

export default AdminPage;