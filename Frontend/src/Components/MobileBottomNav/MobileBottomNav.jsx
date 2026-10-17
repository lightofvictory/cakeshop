import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  HomeFilled,
  AppstoreOutlined,
  AppstoreFilled,
  ShoppingOutlined,
  ShoppingFilled,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import './MobileBottomNav.scss';

const UserFilledIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { getCustomerOrders } = useOrders();

  const currentPath = location.pathname;

  const isHomeActive = currentPath === '/';
  const isMenuActive = currentPath === '/menu' || currentPath === '/categories';
  const isOrdersActive = currentPath === '/orders' || currentPath === '/myorders';
  const isProfileActive =
    currentPath === '/profile' ||
    currentPath === '/signin' ||
    currentPath === '/signup';

  const userOrders = user?.email ? getCustomerOrders(user.email) : [];
  const activeOrdersCount = Array.isArray(userOrders)
    ? userOrders.filter(
        (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'COMPLETED'
      ).length
    : 0;

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`nav-item ${isHomeActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
          {isHomeActive ? <HomeFilled className="nav-icon" /> : <HomeOutlined className="nav-icon" />}
        </div>
        <span className="nav-label">Home</span>
      </Link>

      <Link to="/menu" className={`nav-item ${isMenuActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
          {isMenuActive ? <AppstoreFilled className="nav-icon" /> : <AppstoreOutlined className="nav-icon" />}
        </div>
        <span className="nav-label">Categories</span>
      </Link>

      <Link to="/orders" className={`nav-item ${isOrdersActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
          {isOrdersActive ? <ShoppingFilled className="nav-icon" /> : <ShoppingOutlined className="nav-icon" />}
          {activeOrdersCount > 0 && <span className="orders-badge">{activeOrdersCount}</span>}
        </div>
        <span className="nav-label">My Orders</span>
      </Link>

      <Link
        to={user ? '/profile' : '/signin'}
        className={`nav-item ${isProfileActive ? 'active' : ''}`}
      >
        <div className="icon-wrapper">
          {isProfileActive ? <UserFilledIcon /> : <UserOutlined className="nav-icon" />}
        </div>
        <span className="nav-label">Profile</span>
      </Link>
    </nav>
  );
};

export default MobileBottomNav;
