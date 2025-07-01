import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './ProductSlide.css';

const ProductSlide = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('https://localhost:7100/api/Products')
            .then(res => res.json())
            .then(data => setProducts(data.slice(0, 10)))
            .catch(console.error);
    }, []);
    console.log('asdadasdas',products);
    return (
        <div className="product-slider-wrapper">
            <Swiper
                loop={true}
                spaceBetween={10}
                breakpoints={{
                    320: {
                        slidesPerView: 1.2,
                    },
                    480: {
                        slidesPerView: 2,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                    1024: {
                        slidesPerView: 4,
                    },
                    1280: {
                        slidesPerView: 5,
                    },
                }}
            >

                {products.map(p => (
                    <SwiperSlide key={p.id}>
                        <div className="product-card">
                            <div className="image-container">
                                <img src={p.images[0]} alt={p.name} loading="lazy" />

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
