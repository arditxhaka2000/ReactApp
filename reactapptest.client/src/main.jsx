import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductListingPage from './page/products';

import './index.css';
import App from './App.jsx';
import Home from './page/Home.jsx';
import Account from './page/Account.jsx';
import Cart from './page/Cart.jsx';
import Categories from './page/Categories.jsx';
import Layout from './page/Layout';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Layout>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/app" element={<App />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/category" element={<Categories />} />
                <Route path="/account" element={<Account />} />
                <Route path="/cart" element={<Cart />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    </StrictMode>
);
