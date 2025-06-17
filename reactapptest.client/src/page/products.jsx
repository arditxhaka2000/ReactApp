import React, { useEffect, useState } from 'react';
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
    const [productTypeFilter, setProductTypeFilter] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [styleFilter, setStyleFilter] = useState('');
    const [colorFilter, setColorFilter] = useState('');
    const [bodyFitFilter, setBodyFitFilter] = useState('');
    const [priceRangeFilter, setPriceRangeFilter] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://localhost:7100/api/products');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
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
        if (categoryFilter) filtered = filtered.filter(p => p.category === categoryFilter);
        if (productTypeFilter) filtered = filtered.filter(p => p.productType === productTypeFilter);
        if (sizeFilter) filtered = filtered.filter(p => p.size === sizeFilter);
        if (styleFilter) filtered = filtered.filter(p => p.style === styleFilter);
        if (colorFilter) filtered = filtered.filter(p => p.color === colorFilter);
        if (bodyFitFilter) filtered = filtered.filter(p => p.bodyFit === bodyFitFilter);
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
                default:
                    break;
            }
        }

        setFilteredProducts(filtered);


        setVisibleCount(12); // reset visible count when filters change

    }, [
        products, brandFilter, categoryFilter, productTypeFilter,
        sizeFilter, styleFilter, colorFilter, bodyFitFilter,
        priceRangeFilter, sortFilter
    ]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 12);
    };

    const uniqueBrands = [...new Set(products.map(p => p.brand))];
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    const uniqueProductTypes = [...new Set(products.map(p => p.productType))];
    const uniqueSizes = [...new Set(products.map(p => p.size))];
    const uniqueStyles = [...new Set(products.map(p => p.style))];
    const uniqueColors = [...new Set(products.map(p => p.color))];
    const uniqueBodyFits = [...new Set(products.map(p => p.bodyFit))];

    return (
        <div className="products-page">
            {/* Filters */}
            <div className="filters-container">
                <div className="filter-row">
                    <select value={sortFilter} onChange={e => setSortFilter(e.target.value)} className="filter-dropdown">
                        <option value="">Sort</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-az">Name: A-Z</option>
                        <option value="name-za">Name: Z-A</option>
                    </select>

                    <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="filter-dropdown">
                        <option value="">All</option>
                        {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>

                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="filter-dropdown">
                        <option value="">Category</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                    <select value={productTypeFilter} onChange={e => setProductTypeFilter(e.target.value)} className="filter-dropdown">
                        <option value="">Product Type</option>
                        {uniqueProductTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>

                    <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)} className="filter-dropdown">
                        <option value="">Size</option>
                        {uniqueSizes.map(size => <option key={size} value={size}>{size}</option>)}
                    </select>

                    <select value={styleFilter} onChange={e => setStyleFilter(e.target.value)} className="filter-dropdown">
                        <option value="">Style</option>
                        {uniqueStyles.map(style => <option key={style} value={style}>{style}</option>)}
                    </select>
                </div>

                <div className="filter-row">
                    <select value={colorFilter} onChange={e => setColorFilter(e.target.value)} className="filter-dropdown">
                        <option value="">Colour</option>
                        {uniqueColors.map(color => <option key={color} value={color}>{color}</option>)}
                    </select>

                    <select value={bodyFitFilter} onChange={e => setBodyFitFilter(e.target.value)} className="filter-dropdown">
                        <option value="">Body Fit</option>
                        {uniqueBodyFits.map(fit => <option key={fit} value={fit}>{fit}</option>)}
                    </select>

                    <select value={priceRangeFilter} onChange={e => setPriceRangeFilter(e.target.value)} className="filter-dropdown">
                        <option value="">Price Range</option>
                        <option value="0-25">$0 - $25</option>
                        <option value="25-50">$25 - $50</option>
                        <option value="50-100">$50 - $100</option>
                        <option value="100-200">$100 - $200</option>
                        <option value="200-999">$200+</option>
                    </select>
                </div>

                {error && <p className="error-msg">Error: {error}</p>}
            </div>

            {/* Products grid */}
            <div className="row">
                {loading ? (
                    <p>Loading products...</p>
                ) : filteredProducts.length === 0 ? (
                    <p>No products found.</p>
                ) : (
                    filteredProducts.slice(0, visibleCount).map(product => (
                        <div key={product.id} className="col-3 mb-4">
                            <div
                                className="position-relative"
                                style={{
                                    height: "500px",
                                    width: "100%",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    cursor: "pointer",
                                }}
                            >
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />

                                <div
                                    className="position-absolute bottom-0 start-0 w-100 px-3 py-2"
                                    style={{
                                        background: "white",
                                        color: "#000",
                                        borderBottomLeftRadius: "8px",
                                        borderBottomRightRadius: "8px",
                                    }}
                                >
                                    <div style={{ fontWeight: "600", fontSize: "1rem" }}>{product.name}</div>
                                    <div style={{ fontSize: "0.9rem" }}>${product.price.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Load More button */}
            {visibleCount < filteredProducts.length && (
                <div className="d-flex justify-content-center my-4">
                    <button className="load-more-btn" onClick={handleLoadMore}>
                        Load More
                    </button>
                </div>
            )}

            {filteredProducts.length > 0 && (
                <p className="text-muted text-center my-3">
                    You've viewed {filteredProducts.slice(0, visibleCount).length} of {filteredProducts.length} products
                </p>
            )}
        </div>
    );
};

export default Products;
