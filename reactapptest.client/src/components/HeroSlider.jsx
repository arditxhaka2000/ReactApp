import React, { useState, useEffect } from 'react';
import './HeroSlider.css';

const slides = [
    { type: 'video', src: '/Videos/1.mp4' },
    { type: 'video', src: '/Videos/2.mp4' }
];

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 7000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hero-slider">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                >
                    {slide.type === 'video' && (
                        <video
                            src={slide.src}
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default HeroSlider;
