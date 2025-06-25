import React, { useState, useEffect } from 'react';
import { Heart, Share2, Star, Truck, RotateCcw, Shield, ChevronDown, ChevronUp, Minus, Plus, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import './ProductDetails.css';
import { useNavigate } from 'react-router-dom';

const ProductDetails = ({ productId = 1 }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const navigate = useNavigate();
    // Image zoom and fullscreen states
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Bag drawer states
    const [showBagDrawer, setShowBagDrawer] = useState(false);
    const [bagItems, setBagItems] = useState([]);
    const [drawerSize, setDrawerSize] = useState('');
    const [drawerQuantity, setDrawerQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        if (isFullscreen) {
            document.querySelector('.site-headerMain')?.style.setProperty('display', 'none', 'important');
        } else {
            document.querySelector('.site-headerMain')?.style.setProperty('display', '', '');
        }
    }, [isFullscreen]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7100/api/products/${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
            const data = await response.json();
            setProduct(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (change) => {
        setQuantity(Math.max(1, quantity + change));
    };

    const handleDrawerQuantityChange = (change) => {
        const maxStock = getDrawerSizeStock();
        const newQuantity = Math.max(1, Math.min(10, Math.min(maxStock, drawerQuantity + change)));
        setDrawerQuantity(newQuantity);
    };

    const calculateDiscountPercentage = () => {
        if (product?.originalPrice && product?.price) {
            return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        }
        return 0;
    };

    const getSelectedSizeStock = () => {
        if (!selectedSize || !product?.sizes) return 0;
        const sizeObj = product.sizes.find(s => s.sizeId.toString() === selectedSize);
        return sizeObj?.stockQuantity || 0;
    };

    const getDrawerSizeStock = () => {
        if (!drawerSize || !product?.sizes) return 0;
        const sizeObj = product.sizes.find(s => s.sizeId.toString() === drawerSize);
        return sizeObj?.stockQuantity || 0;
    };

    const getSizeName = (sizeId) => {
        if (!product?.sizes) return '';
        const sizeObj = product.sizes.find(s => s.sizeId.toString() === sizeId);
        return sizeObj?.sizeName || '';
    };

    const handleAddToBag = () => {
        if (!selectedSize || !product.inStock) return;

        const newItem = {
            id: Date.now(),
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.imageUrl,
            size: selectedSize,
            quantity: quantity,
            color: product.color
        };

        setBagItems(prev => [...prev, newItem]);
        setDrawerSize(selectedSize);
        setDrawerQuantity(quantity);
        setShowBagDrawer(true);
    };
    const handleProceedToCheckout = () => {
        const checkoutItems = [{
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.imageUrl,
            size: drawerSize,
            quantity: drawerQuantity,
            color: product.color
        }];

        navigate('/checkout', {
            state: {
                cartItems: checkoutItems
            }
        });
    };
    const handleDrawerSizeChange = (newSizeId) => {
        setDrawerSize(newSizeId);
        const maxStock = product.sizes.find(s => s.sizeId.toString() === newSizeId)?.stockQuantity || 0;
        setDrawerQuantity(Math.min(drawerQuantity, Math.min(10, maxStock)));
    };

    const closeBagDrawer = () => {
        setShowBagDrawer(false);
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}
            />
        ));
    };

    // Image navigation functions
    const nextImage = () => {
        if (product?.images?.length > 1) {
            setSelectedImage((prev) => (prev + 1) % product.images.length);
        }
    };

    const prevImage = () => {
        if (product?.images?.length > 1) {
            setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
        }
    };

    // Zoom functions
    const handleMouseMove = (e) => {
        if (!isZoomed) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setZoomPosition({ x, y });
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    const openFullscreen = () => {
        setIsFullscreen(true);
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);
        setIsZoomed(false);
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (isFullscreen) {
            if (e.key === 'Escape') {
                closeFullscreen();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-grid">
                    <div>
                        <div className="loading-skeleton loading-image"></div>
                        <div className="loading-thumbnails">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="loading-skeleton loading-thumbnail"></div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="loading-skeleton loading-text"></div>
                        <div className="loading-skeleton loading-text small"></div>
                        <div className="loading-skeleton loading-text large"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">Error loading product: {error}</p>
                <button onClick={fetchProduct} className="retry-button">
                    Try Again
                </button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="error-container">
                <p>Product not found</p>
            </div>
        );
    }

    const discountPercentage = calculateDiscountPercentage();

    return (
        <div className="product-details-container">
            <div className="product-grid">
                {/* Image Gallery */}
                <div className="image-gallery">
                    {/* Vertical Thumbnails */}
                    {product.images?.length > 1 && (
                        <div className="thumbnail-sidebar">
                            {product.images.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={() => setSelectedImage(index)}
                                    className={`thumbnail-button-vertical ${selectedImage === index ? 'active' : ''}`}
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt={image.altText || `Product view ${index + 1}`}
                                        className="thumbnail-image-vertical"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="main-image-container">
                        {product.tags?.length > 0 && (
                            <div className="product-tags">
                                {product.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="product-tag"
                                        style={{ backgroundColor: tag.color || '#000' }}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div
                            className={`main-image-wrapper ${isZoomed ? 'zoomed' : ''}`}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setIsZoomed(false)}
                        >
                            <img
                                src={product.images[selectedImage]?.imageUrl || '/api/placeholder/600/800'}
                                alt={product.images[selectedImage]?.altText || product.name}
                                className="main-image"
                                style={isZoomed ? {
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    transform: 'scale(2.5)',
                                    cursor: 'zoom-out'
                                } : { cursor: 'zoom-in' }}
                                onClick={openFullscreen}
                            />

                            {/* Navigation Arrows */}
                            {product.images?.length > 1 && (
                                <>
                                    <button className="nav-arrow prev" onClick={prevImage}>
                                        <ChevronLeft size={30} style={{ color: 'black' }} />
                                    </button>
                                    <button className="nav-arrow next" onClick={nextImage}>
                                        <ChevronRight size={30} style={{ color: 'black' }} />
                                    </button>
                                </>
                            )}

                            {/* Zoom Controls */}
                            <div className="zoom-controls">
                                <button
                                    className="zoom-btn"
                                    onClick={toggleZoom}
                                    title={isZoomed ? "Zoom out" : "Zoom in"}
                                >
                                    {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                                </button>
                            </div>

                            {/* Image Counter */}
                            {product.images?.length > 1 && (
                                <div className="image-counter">
                                    {selectedImage + 1} / {product.images.length}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Information */}
                <div className="product-info">
                    <div className="product-header">
                        <h1>{product.name}</h1>
                        {product.color && <p className="product-color">{product.color}</p>}

                        {product.reviewCount > 0 && (
                            <div className="rating-container">
                                <div className="star-rating">
                                    {renderStars(product.averageRating)}
                                    <span className="review-count">
                                        ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="price-container">
                            <span className="current-price">£{product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                                <>
                                    <span className="original-price">£{product.originalPrice.toFixed(2)}</span>
                                    <span className="discount-badge">
                                        {discountPercentage}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Size Selection */}
                    {product.sizes?.length > 0 && (
                        <div className="size-section">
                            <div className="size-header">
                                <label className="size-label">Size (UK)</label>
                                <button
                                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                                    className="size-guide-button"
                                >
                                    Size Guide
                                </button>
                            </div>
                            <div className="size-grid">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size.sizeId}
                                        onClick={() => setSelectedSize(size.sizeId.toString())}
                                        disabled={!size.isInStock || size.stockQuantity === 0}
                                        className={`size-button ${selectedSize === size.sizeId.toString() ? 'selected' : ''
                                            }`}
                                    >
                                        {size.sizeName.replace('UK', '')}
                                    </button>
                                ))}
                            </div>

                            {selectedSize && getSelectedSizeStock() <= 5 && (
                                <p className="stock-warning">
                                    Only {getSelectedSizeStock()} left in stock!
                                </p>
                            )}
                        </div>
                    )}

                    {/* Size Guide Modal */}
                    {showSizeGuide && product.sizes?.length > 0 && (
                        <div className="size-guide-modal">
                            <div className="size-guide-header">
                                <h3 className="size-guide-title">Size Guide</h3>
                                <button onClick={() => setShowSizeGuide(false)} className="size-guide-close">
                                    <ChevronUp size={20} />
                                </button>
                            </div>
                            <div className="size-guide-table-container">
                                <table className="size-guide-table">
                                    <thead>
                                        <tr>
                                            <th>UK Size</th>
                                            <th>US Size</th>
                                            <th>EU Size</th>
                                            <th>Bust</th>
                                            <th>Waist</th>
                                            <th>Hips</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.sizes.map((size) => (
                                            <tr key={size.sizeId}>
                                                <td>{size.sizeName}</td>
                                                <td>{size.usSize || '-'}</td>
                                                <td>{size.euSize || '-'}</td>
                                                <td>{size.bust || '-'}</td>
                                                <td>{size.waist || '-'}</td>
                                                <td>{size.hips || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="quantity-section">
                        <label className="quantity-label">Quantity</label>
                        <div className="quantity-controls">
                            <div className="quantity-input-group">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="quantity-button"
                                    disabled={quantity <= 1}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="quantity-display">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="quantity-button"
                                    disabled={quantity >= getSelectedSizeStock()}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <span className="quantity-max">
                                Max: {getSelectedSizeStock() || 'Select size'}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            className="add-to-bag-button"
                            disabled={!selectedSize || !product.inStock}
                            onClick={handleAddToBag}
                        >
                            {!product.inStock
                                ? 'Out of Stock'
                                : !selectedSize
                                    ? 'Please select a size'
                                    : 'Add to Bag'
                            }
                        </button>

                        <div className="secondary-buttons">
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`secondary-button ${isWishlisted ? 'wishlisted' : ''}`}
                            >
                                <Heart size={20} className={isWishlisted ? 'filled' : ''} />
                                Wishlist
                            </button>
                            <button className="secondary-button">
                                <Share2 size={20} />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="delivery-info">
                        <div className="delivery-item">
                            <Truck className="delivery-icon" />
                            <span>Free UK delivery on orders over £50</span>
                        </div>
                        <div className="delivery-item">
                            <RotateCcw className="delivery-icon" />
                            <span>Free returns within 28 days</span>
                        </div>
                        <div className="delivery-item">
                            <Shield className="delivery-icon" />
                            <span>Secure payment & data protection</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bag Drawer */}
            {showBagDrawer && (
                <>
                    <div className="bag-drawer-overlay" onClick={closeBagDrawer}></div>
                    <div className="bag-drawer">
                        <div className="bag-drawer-header">
                            <div className="bag-drawer-title">
                                <ShoppingBag size={20} />
                                <h3>Added to Bag</h3>
                            </div>
                            <button onClick={closeBagDrawer} className="bag-drawer-close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bag-drawer-content">
                            <div className="bag-item">
                                <div className="bag-item-image">
                                    <img
                                        src={product.images[0]?.imageUrl}
                                        alt={product.name}
                                    />
                                </div>

                                <div className="bag-item-details">
                                    <h4 className="bag-item-name">{product.name}</h4>
                                    {product.color && (
                                        <p className="bag-item-color">{product.color}</p>
                                    )}
                                    <p className="bag-item-price">£{product.price.toFixed(2)}</p>

                                    {/* Size selection in drawer */}
                                    <div className="bag-item-size">
                                        <label>Size (UK):</label>
                                        <select
                                            value={drawerSize}
                                            onChange={(e) => handleDrawerSizeChange(e.target.value)}
                                            className="bag-size-select"
                                        >
                                            {product.sizes
                                                .filter(size => size.isInStock && size.stockQuantity > 0)
                                                .map((size) => (
                                                    <option key={size.sizeId} value={size.sizeId.toString()}>
                                                        {size.sizeName.replace('UK', '')}
                                                        {size.stockQuantity <= 5 ? ` (${size.stockQuantity} left)` : ''}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    {/* Quantity selection in drawer */}
                                    <div className="bag-item-quantity">
                                        <label>Quantity:</label>
                                        <div className="bag-quantity-controls">
                                            <button
                                                onClick={() => handleDrawerQuantityChange(-1)}
                                                className="bag-quantity-button"
                                                disabled={drawerQuantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="bag-quantity-display">{drawerQuantity}</span>
                                            <button
                                                onClick={() => handleDrawerQuantityChange(1)}
                                                className="bag-quantity-button"
                                                disabled={drawerQuantity >= Math.min(10, getDrawerSizeStock())}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <span className="bag-quantity-limit">
                                            Max: {Math.min(10, getDrawerSizeStock())}
                                        </span>
                                    </div>

                                    {drawerSize && getDrawerSizeStock() <= 5 && (
                                        <p className="bag-stock-warning">
                                            Only {getDrawerSizeStock()} left in stock!
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bag-drawer-summary">
                                <div className="bag-subtotal">
                                    <span>Subtotal:</span>
                                    <span>£{(product.price * drawerQuantity).toFixed(2)}</span>
                                </div>
                                <p className="bag-delivery-note">
                                    {(product.price * drawerQuantity) >= 50
                                        ? "Free delivery included!"
                                        : `Add £${(50 - (product.price * drawerQuantity)).toFixed(2)} for free delivery`
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="bag-drawer-actions">
                            <button className="continue-shopping-btn" onClick={closeBagDrawer}>
                                Continue Shopping
                            </button>
                            <button className="proceed-checkout-btn" onClick={handleProceedToCheckout}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div className="fullscreen-modal" onClick={closeFullscreen}>
                    <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closeFullscreen} style={{ background: 'transparent', width: '80px' }}>
                            <X size={30} />
                        </button>

                        <div className="fullscreen-image-container">
                            <img
                                src={product.images[selectedImage]?.imageUrl}
                                alt={product.images[selectedImage]?.altText || product.name}
                                className={`fullscreen-image ${isZoomed ? 'zoomed' : ''}`}
                                onMouseMove={handleMouseMove}
                                style={isZoomed ? {
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    transform: 'scale(2.5)'
                                } : {}}
                                onClick={toggleZoom}
                            />

                            {product.images?.length > 1 && (
                                <>
                                    <button className="fullscreen-nav prev" onClick={prevImage}>
                                        <ChevronLeft size={32} />
                                    </button>
                                    <button className="fullscreen-nav next" onClick={nextImage}>
                                        <ChevronRight size={32} />
                                    </button>
                                </>
                            )}

                            <div className="fullscreen-counter">
                                {selectedImage + 1} / {product.images?.length || 1}
                            </div>

                            <div className="fullscreen-zoom-controls">
                                <button onClick={toggleZoom} style={{ background: 'transparent' }}>
                                    {isZoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
                                </button>
                            </div>
                        </div>

                        {/* Fullscreen Thumbnails */}
                        {product.images?.length > 1 && (
                            <div className="fullscreen-thumbnails">
                                {product.images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className={`fullscreen-thumbnail ${index === selectedImage ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img
                                            src={image.imageUrl}
                                            alt={image.altText || `View ${index + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Product Details Tabs */}
            <div className="product-tabs-section">
                <div className="tabs-navigation">
                    {['description', 'details', 'delivery', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab} {tab === 'reviews' && product.reviewCount > 0 && `(${product.reviewCount})`}
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    {activeTab === 'description' && (
                        <div className="description-content">
                            <p>{product.description}</p>
                            {product.collection && (
                                <div>
                                    <h4>Collection</h4>
                                    <p>{product.collection.name} - {product.collection.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="details-grid">
                            {product.material && (
                                <div className="detail-item">
                                    <span className="detail-label">Material:</span>
                                    <span className="detail-value">{product.material}</span>
                                </div>
                            )}
                            {product.careInstructions && (
                                <div className="detail-item">
                                    <span className="detail-label">Care:</span>
                                    <span className="detail-value">{product.careInstructions}</span>
                                </div>
                            )}
                            {product.fit && (
                                <div className="detail-item">
                                    <span className="detail-label">Fit:</span>
                                    <span className="detail-value">{product.fit}</span>
                                </div>
                            )}
                            <div className="detail-item">
                                <span className="detail-label">Brand:</span>
                                <span className="detail-value">{product.brand}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Category:</span>
                                <span className="detail-value">{product.category.name}</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'delivery' && (
                        <div className="delivery-content">
                            <div className="delivery-section">
                                <h4>UK Delivery</h4>
                                <p>Standard delivery (3-5 working days): £3.99</p>
                                <p>Next day delivery: £5.99</p>
                                <p>Free delivery on orders over £50</p>
                            </div>
                            <div className="delivery-section">
                                <h4>International Delivery</h4>
                                <p>Available to over 100+ countries worldwide</p>
                                <p>Delivery times and costs vary by location</p>
                            </div>
                            <div className="delivery-section">
                                <h4>Returns</h4>
                                <p>Free returns within 28 days of delivery</p>
                                <p>Items must be unworn with tags attached</p>
                            </div>
                        </div>
                    )}


                    {activeTab === 'reviews' && (
                        <div className="reviews-content">
                            {product.reviewCount > 0 ? (
                                <>
                                    <div className="reviews-summary">
                                        <div className="star-rating">
                                            {renderStars(product.averageRating)}
                                        </div>
                                        <span className="average-rating">{product.averageRating} out of 5</span>
                                        <span className="review-count">({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})</span>
                                    </div>

                                    <div className="reviews-list">
                                        {product.reviews?.map((review) => (
                                            <div key={review.id} className="review-item">
                                                <div className="review-header">
                                                    <div className="review-user-info">
                                                        <div className="star-rating">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                        <span className="review-user-name">{review.userName}</span>
                                                        {review.isVerifiedPurchase && (
                                                            <span className="verified-badge">
                                                                Verified Purchase
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="review-date">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {review.title && (
                                                    <h5 className="review-title">{review.title}</h5>
                                                )}
                                                {review.comment && (
                                                    <p className="review-comment">{review.comment}</p>
                                                )}
                                                {review.helpfulVotes > 0 && (
                                                    <p className="review-helpful">
                                                        {review.helpfulVotes} people found this helpful
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;