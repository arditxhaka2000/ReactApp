import React from 'react';
import HeroSlider from '../components/HeroSlider';
import Collections from '../components/Collections';
import Banner from './Banner';
import ProductSlide from '../components/ProductSlide';

const Home = () => {
    return (
        <div>
            <HeroSlider />
            <Collections />
            <Banner />
            <ProductSlide/>
        </div>
    );
};

export default Home;
