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
            <ProductSlide />
            <Banner 
                imageUrl="/Images/Banner_2.jpeg"
                
            />
        </div>
    );
};

export default Home;
