import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  TagsOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
} from '@ant-design/icons';

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
    ],
  },
  {
    title: 'BUSINESS & INSIGHTS',
    items: [
      { path: '/customers', label: 'Customers', icon: <UsergroupAddOutlined /> },
      { path: '/settings', label: 'Shop Settings', icon: <SettingOutlined /> },
    ],
  },
];

const Sidebar = () => {
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
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <span>{item.label}</span>
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
