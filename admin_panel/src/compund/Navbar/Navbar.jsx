import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Tag, Dropdown, Avatar, Select } from 'antd';
import {
  ShopOutlined,
  CheckCircleFilled,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { adminUser, logout } = useAuth();
  const navigate = useNavigate();

  const [shopSettings, setShopSettings] = useState({
    shopName: 'Mr. Pastry',
    tagline: 'Bakery Inventory & Order System',
    logo: '',
  });

  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(
    localStorage.getItem('admin_selected_outlet') || 'ALL'
  );

  useEffect(() => {
    const fetchShopSettings = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/settings');
        if (res.data && res.data.success && res.data.data) {
          const d = res.data.data;
          setShopSettings({
            shopName: d.shopName || (d.shopSettings && d.shopSettings.shopName) || 'Mr. Pastry',
            tagline: d.tagline || (d.shopSettings && d.shopSettings.tagline) || 'Bakery Inventory & Order System',
            logo: d.logo || (d.shopSettings && d.shopSettings.logo) || '',
          });

          const outletList =
            d.outlets ||
            (d.shopSettings && d.shopSettings.outlets) ||
            [];
          setOutlets(outletList);
        }
      } catch (err) {
        console.error('Failed to load navbar shop settings:', err);
      }
    };
    fetchShopSettings();

    // Listen for setting changes on-demand without polling
    let channel;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('mrpastry_settings_channel');
      channel.onmessage = (event) => {
        if (event.data === 'SETTINGS_UPDATED') {
          fetchShopSettings();
        }
      };
    }
    const handleStorageChange = (e) => {
      if (e.key === 'mrpastry_settings_updated') {
        fetchShopSettings();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const getInitial = () => {
    return adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A';
  };

  const dropdownItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">My Admin Profile</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ef4444' }} />,
      label: <span style={{ color: '#ef4444', fontWeight: 600 }}>Logout</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="admin-navbar">
      {/* Left Branding */}
      <div className="brand-group">
        <div className="brand-icon" style={{ overflow: 'hidden', padding: shopSettings.logo ? 0 : undefined }}>
          {shopSettings.logo ? (
            <img
              src={`http://localhost:3000/images/${shopSettings.logo}`}
              alt="Shop Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          ) : (
            <ShopOutlined />
          )}
        </div>
        <div className="brand-info">
          <div className="brand-title-row">
            <h1>{shopSettings.shopName}</h1>
            <Tag
              color={adminUser?.role === 'employee' ? 'purple' : 'rose'}
              style={{
                border: 0,
                backgroundColor: adminUser?.role === 'employee' ? '#f3e8ff' : '#ffe4e6',
                color: adminUser?.role === 'employee' ? '#9333ea' : '#f43f5e',
                fontWeight: 800,
                borderRadius: '20px',
                fontSize: '10px',
              }}
            >
              {adminUser?.role === 'employee' ? 'STAFF PANEL' : 'ADMIN PANEL'}
            </Tag>
          </div>
          <p>{shopSettings.tagline}</p>
        </div>
      </div>

      {/* Right Actions & Profile */}
      <div className="navbar-actions">
        {/* Render Outlet Switcher ONLY IF MORE THAN ONE OUTLET EXISTS */}
        {outlets.length > 1 && (
          <div className="outlet-switcher-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <EnvironmentOutlined style={{ color: '#f43f5e' }} /> Outlet:
            </span>
            <Select
              value={selectedOutlet}
              onChange={(val) => {
                setSelectedOutlet(val);
                localStorage.setItem('admin_selected_outlet', val);
                window.dispatchEvent(new Event('admin_outlet_changed'));
              }}
              size="middle"
              style={{ width: '220px', fontWeight: 700 }}
            >
              <Select.Option value="ALL">🏪 All Outlets ({outlets.length})</Select.Option>
              {outlets.map((o, idx) => (
                <Select.Option key={o.id || idx} value={o.name}>
                  📍 {o.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}

        <Tag
          icon={<CheckCircleFilled style={{ color: '#10b981' }} />}
          color="success"
          style={{ padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '12px' }}
        >
          NestJS API Online
        </Tag>

        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" trigger={['click']}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingLeft: '12px',
              borderLeft: '1px solid #e2e8f0',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <Avatar
              size={36}
              src={adminUser?.avatar || null}
              style={{
                backgroundColor: '#ffe4e6',
                color: '#f43f5e',
                fontWeight: 800,
              }}
            >
              {!adminUser?.avatar && getInitial()}
            </Avatar>
            <div className="hidden md:block">
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {adminUser?.name || 'Master Admin'}
              </p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>
                {adminUser?.email || 'admin@mrpastry.com'}
              </p>
            </div>
            <DownOutlined style={{ fontSize: '10px', color: '#94a3b8' }} />
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Navbar;
