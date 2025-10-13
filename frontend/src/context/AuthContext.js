import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      authService.getCurrentUser()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (token, newPassword) => {
    return await authService.resetPassword(token, newPassword);
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changePassword(currentPassword, newPassword);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};