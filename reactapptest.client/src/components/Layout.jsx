import React from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <main style={{ minHeight: '80vh', background: 'white' }}>{children}</main>

            <Footer />
        </>
    );
};

export default Layout;
