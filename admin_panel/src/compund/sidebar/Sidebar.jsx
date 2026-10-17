import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  TagsOutlined,
  PercentageOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const Sidebar = () => {
  const { isEmployee } = useAuth();

  const menuGroups = [
    {
      title: 'MAIN CONTROL',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
        { path: '/orders', label: 'Order Lifecycle', icon: <ShoppingOutlined /> },
        { path: '/kanban', label: 'Preparation Board', icon: <AppstoreOutlined /> },
      ],
    },
    {
      title: 'MENU & INVENTORY',
      items: [
        { path: '/products', label: 'Products Catalog', icon: <UnorderedListOutlined /> },
        { path: '/categories', label: 'Categories', icon: <TagsOutlined /> },
        { path: '/offers', label: 'Offers & Discounts', icon: <PercentageOutlined /> },
      ],
    },
    {
      title: 'BUSINESS & INSIGHTS',
      items: [
        { path: '/customers', label: 'Customers', icon: <UsergroupAddOutlined /> },
        { path: '/employees', label: 'Staff & Employees', icon: <TeamOutlined /> },
        { path: '/settings', label: 'Shop Settings', icon: <SettingOutlined /> },
        { path: '/profile', label: 'My Profile', icon: <UserOutlined /> },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div>
        {menuGroups.map((group) => (
          <div key={group.title} className="sidebar-nav-group">
            <p className="group-title">{group.title}</p>
            <div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className ="link-icon" style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  <span className="link-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer-card">
        <p className="title">🟢 Store Active</p>
        <p className="subtitle">Live syncing with Frontend</p>
      </div>
    </aside>
  );
};

export default Sidebar;
