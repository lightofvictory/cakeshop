import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:3000/api/users';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin profile when token changes or on initial mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!token) {
        setAdminUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.success) {
          setAdminUser(response.data.user);
        } else {
          // Token invalid or user not found
          logout();
        }
      } catch (error) {
        console.error('Error loading admin profile:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, { email, password });
      if (response.data && response.data.success) {
        const newToken = response.data.token;
        const userObj = response.data.user;

        localStorage.setItem('adminToken', newToken);
        setToken(newToken);
        setAdminUser(userObj);
        return { success: true, message: 'Login successful' };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role = 'employee') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/register`, { name, email, password, role });
      if (response.data && response.data.success) {
        const newToken = response.data.token;
        const userObj = response.data.user;

        localStorage.setItem('adminToken', newToken);
        setToken(newToken);
        setAdminUser(userObj);
        return { success: true, message: 'Account registered successfully' };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        setAdminUser(response.data.user);
        return { success: true, message: response.data.message || 'Profile updated successfully' };
      }
      return { success: false, message: response.data.message || 'Update failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.clear();
    setToken('');
    setAdminUser(null);
  };

  const isAdmin = adminUser?.role === 'admin';
  const isEmployee = adminUser?.role === 'employee';

  return (
    <AuthContext.Provider
      value={{
        token,
        adminUser,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!token && !!adminUser,
        isAdmin,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
