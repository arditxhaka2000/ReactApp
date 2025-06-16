import { useEffect, useState } from 'react';
import Header from './page/Header';
import Footer from './page/Footer';
import Home from './page/Home';

const App = () => {
    return (
        <>
            <Header />
            <main>
                <Home />
            </main>
            <Footer />
        </>
    );
};

export default App;
