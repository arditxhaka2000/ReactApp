import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductListingPage from './page/product';

import './index.css';
import App from './App.jsx';
import Home from './page/Home.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/app" element={<App />} />
                <Route path="/product" element={<ProductListingPage />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
