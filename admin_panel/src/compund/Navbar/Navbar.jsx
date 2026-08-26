import React from 'react';
import { Tag } from 'antd';
import { ShopOutlined, CheckCircleFilled } from '@ant-design/icons';

const Navbar = () => {
  return (
    <header className="admin-navbar">
      {/* Left Branding */}
      <div className="brand-group">
        <div className="brand-icon">
          <ShopOutlined />
        </div>
        <div className="brand-info">
          <div className="brand-title-row">
            <h1>Mr. Pastry</h1>
            <Tag color="rose" style={{ border: 0, backgroundColor: '#ffe4e6', color: '#f43f5e', fontWeight: 800, borderRadius: '20px', fontSize: '10px' }}>
              ADMIN PANEL
            </Tag>
          </div>
          <p>Bakery Inventory & Order System</p>
        </div>
      </div>

      {/* Right Actions & Status */}
      <div className="navbar-actions">
        <Tag icon={<CheckCircleFilled style={{ color: '#10b981' }} />} color="success" style={{ padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '12px' }}>
          NestJS API Online
        </Tag>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px', borderLeft: '1px solid #e2e8f0' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffe4e6', color: '#f43f5e', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            A
          </div>
          <div className="hidden md:block">
            <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Master Admin</p>
            <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>admin@mrpastry.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
