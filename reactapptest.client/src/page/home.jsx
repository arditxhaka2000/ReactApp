import React from 'react';
import { Link } from 'react-router-dom';

import './Home.css'

const Home = () => {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Welcome to My E-Commerce Store</h1>
                    <p>Discover the best deals and latest products!</p>
                    <Link to="/product" className="btn-shop">
                        Shop Now
                    </Link>
                </div>
            </section>

            {/* Categories */}
            <section className="categories">
                <h2>Shop by Category</h2>
                <div className="category-list">
                    <div className="category-card">Men</div>
                    <div className="category-card">Women</div>
                    <div className="category-card">Electronics</div>
                    <div className="category-card">Home & Garden</div>
                </div>
            </section>

            {/* Featured Products Placeholder */}
            <section className="featured-products">
                <h2>Featured Products</h2>
                <div className="product-grid">
                    <div className="product-card">Product 1</div>
                    <div className="product-card">Product 2</div>
                    <div className="product-card">Product 3</div>
                    <div className="product-card">Product 4</div>
                </div>
            </section>
        </div>
    );
};

export default Home;
