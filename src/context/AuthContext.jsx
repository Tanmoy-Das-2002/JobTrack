import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jobtrack_token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure default authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('jobtrack_token', token);
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('jobtrack_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Verify token with backend /api/auth/me
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to verify session token:', err.response?.data?.message || err.message);
      setToken('');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register new account
  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/register', userData);
      setToken(res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Login existing account
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Invalid credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout
  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('jobtrack_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
