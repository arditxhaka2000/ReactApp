// AuthContext.jsx - Fixed Authentication Context Provider
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in on app start
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            // Use consistent token key
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('https://localhost:7100/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    // Invalid token, clean up all possible tokens
                    clearAllTokens();
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            clearAllTokens();
        } finally {
            setLoading(false);
        }
    };

    const clearAllTokens = () => {
        // Clear all possible token variations
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminToken');
        sessionStorage.clear();
    };

    const login = async (email, password) => {
        try {
            const response = await fetch('https://localhost:7100/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();

                // Clear any existing tokens first
                clearAllTokens();

                // Store with consistent key
                localStorage.setItem('token', data.token);
                setUser(data.user);
                setIsAuthenticated(true);
                return { success: true, user: data.user };
            } else {
                const error = await response.json();
                return { success: false, message: error.message };
            }
        } catch (error) {
            return { success: false, message: 'Network error occurred' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('https://localhost:7100/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();

                // Clear any existing tokens first
                clearAllTokens();

                // Store with consistent key
                localStorage.setItem('token', data.token);
                setUser(data.user);
                setIsAuthenticated(true);
                return { success: true, user: data.user };
            } else {
                const error = await response.json();
                return { success: false, message: error.message };
            }
        } catch (error) {
            return { success: false, message: 'Network error occurred' };
        }
    };

    const logout = () => {
        clearAllTokens();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateProfile = async (profileData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://localhost:7100/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                return { success: true };
            } else {
                const error = await response.json();
                return { success: false, message: error.message };
            }
        } catch (error) {
            return { success: false, message: 'Network error occurred' };
        }
    };

    // Helper function to check if current user is admin
    const isAdmin = () => {
        return user && (user.isAdmin || user.role === 'Admin' || user.role === 'SuperAdmin');
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
        checkAuthStatus,
        isAdmin,
        clearAllTokens
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};