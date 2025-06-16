import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const sliderRef = useRef(null);

    useEffect(() => {
        fetch('https://localhost:7100/api/category')
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((err) => console.error('Failed to fetch categories:', err));
    }, []);

    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        const onMouseDown = (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };

        const onMouseLeave = () => {
            isDown = false;
            slider.classList.remove('active');
        };

        const onMouseUp = () => {
            isDown = false;
            slider.classList.remove('active');
        };

        const onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        };

        slider.addEventListener('mousedown', onMouseDown);
        slider.addEventListener('mouseleave', onMouseLeave);
        slider.addEventListener('mouseup', onMouseUp);
        slider.addEventListener('mousemove', onMouseMove);

        return () => {
            slider.removeEventListener('mousedown', onMouseDown);
            slider.removeEventListener('mouseleave', onMouseLeave);
            slider.removeEventListener('mouseup', onMouseUp);
            slider.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <div className="home-container">
            <section className="hero">
                <div className="hero-content">
                    <h1>Welcome to My E-Commerce Store</h1>
                    <p>Discover the best deals and latest products!</p>
                    <Link to="/products" className="btn-shop">
                        Shop Now
                    </Link>
                </div>
            </section>

            <section className="categories">
                <h2>Shop by Category</h2>
                <div className="category-list" ref={sliderRef}>
                    {categories.length === 0 ? (
                        <p>Loading categories...</p>
                    ) : (
                        categories.map((category) => (
                            <div key={category.id} className="category-card">
                                {category.name}
                            </div>
                        ))
                    )}
                </div>
            </section>

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
