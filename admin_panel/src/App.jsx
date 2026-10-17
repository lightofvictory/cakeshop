import React from 'react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './compund/Navbar/Navbar';
import Sidebar from './compund/sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import List from './pages/List/List';
import Order from './pages/Order/Order';
import PreparationBoard from './pages/Order/PreparationBoard';
import Categories from './pages/Categories/Categories';
import Offers from './pages/Offers/Offers';
import Customers from './pages/Customers/Customers';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import Employees from './pages/Employees/Employees';
import Login from './pages/Auth/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import { Spin } from 'antd';
import 'react-toastify/dist/ReactToastify.css';
import './Admin.scss';

const AdminOnlyRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    toast.warning('Access Restricted: Only Admin accounts can access Shop Settings.');
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <Spin size="large" description="Loading Admin Panel..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-app-container">
      <Navbar />
      <div className="admin-workspace-body">
        <Sidebar />
        <main className="admin-main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/kanban" element={<PreparationBoard />} />
            <Route path="/products" element={<List />} />
            <Route path="/list" element={<Navigate to="/products" replace />} />
            <Route path="/add" element={<Navigate to="/products?openCreate=true" replace />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
            <Route path="/order" element={<Navigate to="/orders" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AuthRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

const App = () => {
  React.useEffect(() => {
    const syncShopMeta = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/settings');
        if (res.data && res.data.success && res.data.data) {
          const d = res.data.data;
          const shopName = d.shopName || (d.shopSettings && d.shopSettings.shopName);
          const logo = d.logo || (d.shopSettings && d.shopSettings.logo);

          if (shopName) {
            document.title = shopName;
          }
          if (logo) {
            const logoUrl = `http://localhost:3000/images/${logo}`;
            let favicon = document.querySelector("link[rel*='icon']");
            if (!favicon) {
              favicon = document.createElement('link');
              favicon.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(favicon);
            }
            favicon.href = logoUrl;
          }
        }
      } catch (err) {
        console.error('Failed to sync shop metadata in admin:', err);
      }
    };
    syncShopMeta();
  }, []);

  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Routes>
        <Route path="/login" element={<AuthRoute />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;