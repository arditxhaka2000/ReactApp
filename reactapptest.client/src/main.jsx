// Updated main.jsx with proper routing and authentication
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminProtectedRoute from './AdminProtectedRoute.jsx';
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
import LoginRegisterPage from './components/LoginRegisterPage';
import UserDashboard from './page/UserDashboard.jsx';
import AdminDashboard from './components/AdminPage.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<App />} />
                        <Route path="/app" element={<App />} />
                        <Route path="/products" element={<ProductListingPage />} />
                        <Route path="/products/:id" element={<ProductDetails />} />
                        <Route path="/category" element={<Categories />} />
                        <Route path="/collections" element={<Collections />} />
                        <Route path="/cart" element={<Cart />} />

                        {/* Authentication routes */}
                        <Route path="/login" element={<LoginRegisterPage />} />
                        <Route path="/register" element={<LoginRegisterPage />} />
                        <Route path="/auth" element={<LoginRegisterPage />} />

                        {/* Protected routes for authenticated users */}
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

                        {/* Admin-only protected route */}
                        <Route
                            path="/admin"
                            element={
                                <AdminProtectedRoute>
                                    <AdminDashboard />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/*"
                            element={
                                <AdminProtectedRoute>
                                    <AdminDashboard />
                                </AdminProtectedRoute>
                            }
                        />

                        {/* Catch-all redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
);