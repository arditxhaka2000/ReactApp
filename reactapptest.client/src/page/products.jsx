import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [visibleCount, setVisibleCount] = useState(12);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sortFilter, setSortFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [collectionFilter, setCollectionFilter] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [colorFilter, setColorFilter] = useState('');
    const [priceRangeFilter, setPriceRangeFilter] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://localhost:7100/api/Products');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            console.log('Fetched products:', data);
            if (!Array.isArray(data)) throw new Error('Expected an array of products');

            setProducts(data);
            setFilteredProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = [...products];

        if (brandFilter) filtered = filtered.filter(p => p.brand === brandFilter);
        if (categoryFilter) filtered = filtered.filter(p => p.category?.name === categoryFilter);
        if (collectionFilter) filtered = filtered.filter(p => p.collection?.name === collectionFilter);
        if (colorFilter) filtered = filtered.filter(p => p.color === colorFilter);

        // Size filtering - check if any available sizes match
        if (sizeFilter) {
            filtered = filtered.filter(p =>
                p.sizes?.some(size => size.sizeName === sizeFilter && size.isInStock)
            );
        }

        if (priceRangeFilter) {
            const [min, max] = priceRangeFilter.split('-').map(Number);
            filtered = filtered.filter(p => p.price >= min && p.price <= max);
        }

        if (sortFilter) {
            switch (sortFilter) {
                case 'price-low':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'name-az':
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-za':
                    filtered.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'newest':
                    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                default:
                    break;
            }
        }

        setFilteredProducts(filtered);
        setVisibleCount(12); // reset visible count when filters change

    }, [
        products, brandFilter, categoryFilter, collectionFilter,
        sizeFilter, colorFilter, priceRangeFilter, sortFilter
    ]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 12);
    };

    // Updated to work with new API structure
    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    const uniqueCategories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];
    const uniqueCollections = [...new Set(products.map(p => p.collection?.name).filter(Boolean))];
    const uniqueColors = [...new Set(products.map(p => p.color).filter(Boolean))];

    // Get all available sizes from all products
    const uniqueSizes = [...new Set(
        products.flatMap(p =>
            p.sizes?.filter(size => size.isInStock).map(size => size.sizeName) || []
        )
    )].sort((a, b) => {
        // Sort sizes properly (UK4, UK6, UK8, etc.)
        const numA = parseInt(a.replace(/\D/g, ''));
        const numB = parseInt(b.replace(/\D/g, ''));
        return numA - numB;
    });

    const calculateDiscountPercentage = (price, originalPrice) => {
        if (originalPrice && originalPrice > price) {
            return Math.round(((originalPrice - price) / originalPrice) * 100);
        }
        return 0;
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span
                key={i}
                className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}
                style={{
                    color: i < Math.floor(rating) ? '#fbbf24' : '#d1d5db',
                    fontSize: '12px'
                }}
            >
                ★
            </span>
        ));
    };

    return (
        <div className="products-page">
            {/* Filters */}
            <div className="filters-container">
                <div className="filter-row">
                    <select value={sortFilter} onChange={e => setSortFilter(e.target.value)} className="filter-dropdown">
                        <option value="">Sort By</option>
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-az">Name: A-Z</option>
                        <option value="name-za">Name: Z-A</option>
                    </select>

                    <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="filter-dropdown">
                        <option value="">All Brands</option>
                        {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>

                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="filter-dropdown">
                        <option value="">All Categories</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                    <select value={collectionFilter} onChange={e => setCollectionFilter(e.target.value)} className="filter-dropdown">
                        <option value="">All Collections</option>
                        {uniqueCollections.map(collection => <option key={collection} value={collection}>{collection}</option>)}
                    </select>

                    <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)} className="filter-dropdown">
                        <option value="">All Sizes</option>
                        {uniqueSizes.map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </div>

                <div className="filter-row">
                    <select value={colorFilter} onChange={e => setColorFilter(e.target.value)} className="filter-dropdown">
                        <option value="">All Colours</option>
                        {uniqueColors.map(color => <option key={color} value={color}>{color}</option>)}
                    </select>

                    <select value={priceRangeFilter} onChange={e => setPriceRangeFilter(e.target.value)} className="filter-dropdown">
                        <option value="">All Prices</option>
                        <option value="0-50">£0 - £50</option>
                        <option value="50-75">£50 - £75</option>
                        <option value="75-100">£75 - £100</option>
                        <option value="100-150">£100 - £150</option>
                        <option value="150-999">£150+</option>
                    </select>

                    <button
                        onClick={() => {
                            setSortFilter('');
                            setBrandFilter('');
                            setCategoryFilter('');
                            setCollectionFilter('');
                            setSizeFilter('');
                            setColorFilter('');
                            setPriceRangeFilter('');
                        }}
                        className="filter-dropdown"
                        style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}
                    >
                        Clear Filters
                    </button>
                </div>

                {error && <p className="error-msg">Error: {error}</p>}
            </div>

            {/* Results summary */}
            {!loading && (
                <div className="results-summary" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                    Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} products
                </div>
            )}

            {/* Products grid */}
            <div className="row">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <p>Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
                        <p>No products found matching your filters.</p>
                        <button
                            onClick={() => {
                                setSortFilter('');
                                setBrandFilter('');
                                setCategoryFilter('');
                                setCollectionFilter('');
                                setSizeFilter('');
                                setColorFilter('');
                                setPriceRangeFilter('');
                            }}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#000',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    filteredProducts.slice(0, visibleCount).map(product => {
                        const discountPercentage = calculateDiscountPercentage(product.price, product.originalPrice);
                        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

                        return (
                            <div key={product.id} className="col-3 mb-4">
                                <Link
                                    to={`/products/${product.id}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div
                                        className="position-relative product-card"
                                        style={{
                                            height: "500px",
                                            width: "100%",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                            cursor: "pointer",
                                            transition: "transform 0.2s ease, box-shadow 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                                        }}
                                    >
                                        {/* Product Tags */}
                                        {product.tags?.length > 0 && (
                                            <div className="position-absolute" style={{ top: '8px', left: '8px', zIndex: 2 }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {product.tags.slice(0, 2).map((tag) => (
                                                        <span
                                                            key={tag.id}
                                                            style={{
                                                                backgroundColor: tag.color || '#000',
                                                                color: 'white',
                                                                fontSize: '10px',
                                                                fontWeight: '600',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                textTransform: 'uppercase'
                                                            }}
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Discount badge */}
                                        {discountPercentage > 0 && (
                                            <div
                                                className="position-absolute"
                                                style={{
                                                    top: '8px',
                                                    right: '8px',
                                                    backgroundColor: '#ef4444',
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    zIndex: 2
                                                }}
                                            >
                                                -{discountPercentage}%
                                            </div>
                                        )}

                                        <img
                                            src={primaryImage?.imageUrl || product.imageUrl || '/api/placeholder/400/500'}
                                            alt={product.name}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block",
                                            }}
                                        />

                                        <div
                                            className="position-absolute bottom-0 start-0 w-100 px-3 py-3"
                                            style={{
                                                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                                color: "#fff",
                                                borderBottomLeftRadius: "8px",
                                                borderBottomRightRadius: "8px",
                                            }}
                                        >
                                            <div style={{ fontWeight: "600", fontSize: "1rem", marginBottom: "4px" }}>
                                                {product.name}
                                            </div>

                                            {product.color && (
                                                <div style={{ fontSize: "0.8rem", opacity: "0.9", marginBottom: "4px" }}>
                                                    {product.color}
                                                </div>
                                            )}

                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                                                    £{product.price.toFixed(2)}
                                                </span>
                                                {product.originalPrice && (
                                                    <span style={{
                                                        fontSize: "0.9rem",
                                                        textDecoration: "line-through",
                                                        opacity: "0.7"
                                                    }}>
                                                        £{product.originalPrice.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating */}
                                            {product.reviewCount > 0 && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                    {renderStars(product.averageRating)}
                                                    <span style={{ fontSize: "0.7rem", opacity: "0.8" }}>
                                                        ({product.reviewCount})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Load More button */}
            {visibleCount < filteredProducts.length && (
                <div className="d-flex justify-content-center my-4">
                    <button
                        className="load-more-btn"
                        onClick={handleLoadMore}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#000',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Load More ({filteredProducts.length - visibleCount} remaining)
                    </button>
                </div>
            )}

            {filteredProducts.length > 0 && (
                <p className="text-muted text-center my-3">
                    You've viewed {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} products
                </p>
            )}
        </div>
    );
};

export default Products;