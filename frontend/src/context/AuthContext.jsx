import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eb_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('eb_auth_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('eb_auth_token');
    localStorage.removeItem('eb_auth_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleAutoLogout = () => {
      logout();
    };
    window.addEventListener('auth-logout', handleAutoLogout);
    return () => window.removeEventListener('auth-logout', handleAutoLogout);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('eb_auth_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          localStorage.setItem('eb_auth_user', JSON.stringify(res.data.user));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (identifier, password) => {
    const res = await authAPI.login({ identifier, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('eb_auth_token', receivedToken);
    localStorage.setItem('eb_auth_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('eb_auth_token', receivedToken);
    localStorage.setItem('eb_auth_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
      localStorage.setItem('eb_auth_user', JSON.stringify(res.data.user));
    } catch (e) {
      console.error('Failed to refresh user data', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isConsumer: user?.role === 'consumer',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
