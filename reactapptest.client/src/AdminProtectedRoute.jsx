// AdminProtectedRoute.jsx - Protected route specifically for admin access
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import { Package, X } from 'lucide-react';

const AdminProtectedRoute = ({ children }) => {
    const { user, isAuthenticated, loading, isAdmin } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Checking permissions...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Show access denied if authenticated but not admin
    if (!isAdmin()) {
        return <AccessDeniedPage />;
    }

    // User is authenticated and is admin, render the protected component
    return children;
};

const AccessDeniedPage = () => {
    const { user, logout } = useAuth();

    const handleBackHome = () => {
        window.location.href = '/';
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="access-denied-container">
            <div className="access-denied-card">
                <div className="access-denied-header">
                    <X size={64} className="access-denied-icon" />
                    <h1>Access Denied</h1>
                    <p className="access-denied-message">
                        You don't have administrator privileges to access this page.
                    </p>

                    {user && (
                        <div className="user-info">
                            <p><strong>Logged in as:</strong> {user.firstName} {user.lastName}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                        </div>
                    )}
                </div>

                <div className="access-denied-actions">
                    <button onClick={handleBackHome} className="btn-secondary">
                        Back to Home
                    </button>
                    <button onClick={handleLogout} className="btn-primary">
                        Logout & Switch User
                    </button>
                </div>
            </div>

            <style jsx>{`
                .access-denied-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                }

                .access-denied-card {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }

                .access-denied-header h1 {
                    color: #e53e3e;
                    margin: 20px 0 10px 0;
                    font-size: 2rem;
                    font-weight: 700;
                }

                .access-denied-icon {
                    color: #e53e3e;
                    margin-bottom: 10px;
                }

                .access-denied-message {
                    color: #666;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }

                .user-info {
                    background: #f7fafc;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                }

                .user-info p {
                    margin: 8px 0;
                    color: #4a5568;
                }

                .user-info strong {
                    color: #2d3748;
                }

                .access-denied-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .btn-primary, .btn-secondary {
                    padding: 12px 24px;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 140px;
                    font-size: 14px;
                }

                .btn-primary {
                    background: #3182ce;
                    color: white;
                }

                .btn-primary:hover {
                    background: #2c5aa0;
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: #e2e8f0;
                    color: #4a5568;
                }

                .btn-secondary:hover {
                    background: #cbd5e0;
                    transform: translateY(-1px);
                }

                .loading-spinner {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3182ce;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 480px) {
                    .access-denied-card {
                        padding: 30px 20px;
                    }
                    
                    .access-denied-actions {
                        flex-direction: column;
                    }
                    
                    .btn-primary, .btn-secondary {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminProtectedRoute;