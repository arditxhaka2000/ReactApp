import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './ProductSlide.css';

const ProductSlide = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('https://localhost:7100/api/products')
            .then(res => res.json())
            .then(data => setProducts(data.slice(0, 10)))
            .catch(console.error);
    }, []);

    return (
        <div className="product-slider-wrapper">
            <Swiper slidesPerView={5} spaceBetween={10} loop={true}>
                {products.map(p => (
                    <SwiperSlide key={p.id}>
                        <div className="product-card">
                            <div className="image-container">
                                <img src={p.imageUrl} alt={p.name} />
                                <button className="quick-buy-btn">Quick Buy</button>
                            </div>
                            <div className="product-info">
                                <h4>{p.name}</h4>
                                <p>{p.price}</p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ProductSlide;
