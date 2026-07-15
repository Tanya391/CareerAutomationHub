import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, loginUser, registerUser, updateProfile } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Failed to load profile on start:', error.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Handle Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      throw error.response?.data?.error || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const register = async (name, email, password, skills_keywords, min_match_score) => {
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password, skills_keywords, min_match_score });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      throw error.response?.data?.error || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Handle Profile Update
  const updateUserData = async (profileData) => {
    try {
      const data = await updateProfile(profileData);
      setUser(prev => ({
        ...prev,
        ...data.user
      }));
      return data.user;
    } catch (error) {
      throw error.response?.data?.error || 'Profile update failed';
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserData,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
