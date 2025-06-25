import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute'; // Fixed import - using named export
import ProductListingPage from './page/products';
import ProductDetails from './page/details';
import './index.css';
import App from './App.jsx';
import Account from './page/Account.jsx';
import Cart from './page/Cart.jsx';
import Categories from './page/Categories.jsx';
import Collections from './components/collections.jsx';
import Layout from './components/Layout';
import Checkout from './page/checkout.jsx';
import OrderView from './components/OrderView.jsx';
import LoginRegisterPage from './components/LoginRegisterPage'; // New combined page
import UserDashboard from './page/UserDashboard.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        {/* Public routes - no authentication required */}
                        <Route path="/" element={<App />} />
                        <Route path="/app" element={<App />} />
                        <Route path="/products" element={<ProductListingPage />} />
                        <Route path="/products/:id" element={<ProductDetails />} />
                        <Route path="/category" element={<Categories />} />
                        <Route path="/collections" element={<Collections />} />
                        <Route path="/cart" element={<Cart />} />

                        {/* Authentication routes - Combined login/register page */}
                        <Route path="/login" element={<LoginRegisterPage />} />
                        <Route path="/register" element={<LoginRegisterPage />} />
                        <Route path="/auth" element={<LoginRegisterPage />} />

                        {/* Protected routes - require authentication */}
                        <Route
                            path="/checkout"
                            element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/orders/:orderNumber"
                            element={
                                <ProtectedRoute>
                                    <OrderView />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
);