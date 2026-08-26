import React from 'react';
import Navbar from './compund/Navbar/Navbar';
import Sidebar from './compund/sidebar/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import List from './pages/List/List';
import Order from './pages/Order/Order';
import PreparationBoard from './pages/Order/PreparationBoard';
import Categories from './pages/Categories/Categories';
import Customers from './pages/Customers/Customers';
import Settings from './pages/Settings/Settings';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Admin.scss';

const App = () => {
  return (
    <div className="admin-app-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
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
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
            <Route path="/order" element={<Navigate to="/orders" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;