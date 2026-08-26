import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Statistic, Table, Tag, Button, Switch, Row, Col } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  RightOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const defaultStats = {
  todayOrders: 0,
  todayRevenue: 0,
  pendingOrders: 0,
  kitchenPreparing: 0,
  readyForDispatch: 0,
};

const Dashboard = () => {
  const url = 'http://localhost:3000';
  const navigate = useNavigate();
  const [stats, setStats] = useState(defaultStats);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeOpen, setStoreOpen] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${url}/api/orders/stats`),
        axios.get(`${url}/api/orders`),
      ]);

      if (statsRes.data && statsRes.data.success && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
      if (ordersRes.data && ordersRes.data.success && Array.isArray(ordersRes.data.data)) {
        setRecentOrders(ordersRes.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await axios.patch(`${url}/api/orders/${id}/status`, { status });
      if (res.data && res.data.success) {
        toast.success(`Order status updated to ${status}`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getTagColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'gold';
      case 'ACCEPTED':
        return 'blue';
      case 'PREPARING':
        return 'purple';
      case 'READY':
        return 'cyan';
      case 'OUT_FOR_DELIVERY':
        return 'geekblue';
      case 'COMPLETED':
        return 'green';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{text}</strong>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <div>
          <p style={{ fontWeight: 800, margin: 0, color: '#0f172a' }}>{customer?.name || 'Guest'}</p>
          <p style={{ fontSize: '11px', color: '#f43f5e', margin: 0, fontWeight: 700 }}>📞 {customer?.phone}</p>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'orderType',
      key: 'orderType',
      render: (type) => (
        <Tag color="purple" style={{ fontWeight: 700 }}>
          {type === 'DELIVERY' ? '🚚 Delivery' : type === 'PICKUP' ? '🏪 Pickup' : '🍽️ Dine-In'}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <strong style={{ color: '#0f172a', fontWeight: 900 }}>₹{total}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getTagColor(status)} style={{ fontWeight: 800, textTransform: 'uppercase' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Quick Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {record.status === 'NEW' && (
            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: '#10b981', fontWeight: 700 }}
              onClick={() => updateOrderStatus(record._id, 'ACCEPTED')}
            >
              Accept
            </Button>
          )}
          {record.status === 'ACCEPTED' && (
            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: '#9333ea', fontWeight: 700 }}
              onClick={() => updateOrderStatus(record._id, 'PREPARING')}
            >
              Prepare
            </Button>
          )}
          {record.status === 'PREPARING' && (
            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: '#10b981', fontWeight: 700 }}
              onClick={() => updateOrderStatus(record._id, 'READY')}
            >
              Mark Ready
            </Button>
          )}
          <Button size="small" onClick={() => navigate('/orders')} style={{ fontWeight: 700 }}>
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="page-header-card">
        <div className="header-info">
          <span className="badge-pill">
            <ShopOutlined /> Real-Time Control System
          </span>
          <h2>Cake Shop Business Overview</h2>
          <p>Live store activity, pending orders, and kitchen preparation monitor.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Store Operating Status</p>
            <p style={{ fontSize: '13px', fontWeight: 800, color: storeOpen ? '#10b981' : '#f43f5e', margin: 0 }}>
              {storeOpen ? '🟢 OPEN & ACCEPTING ORDERS' : '🔴 CLOSED FOR NEW ORDERS'}
            </p>
          </div>
          <Switch checked={storeOpen} onChange={(checked) => setStoreOpen(checked)} />
        </div>
      </div>

      {/* KPI Cards Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable styles={{ body: { padding: '20px' } }} style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Today's Orders</span>}
              value={stats?.todayOrders ?? 0}
              prefix={<ShoppingOutlined style={{ color: '#f43f5e', marginRight: '8px' }} />}
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
            <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, margin: '8px 0 0' }}>↑ 12% from yesterday</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable styles={{ body: { padding: '20px' } }} style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Today's Revenue</span>}
              value={stats?.todayRevenue ?? 0}
              prefix={<DollarOutlined style={{ color: '#10b981', marginRight: '8px' }} />}
              suffix="₹"
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
            <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, margin: '8px 0 0' }}>↑ 8.5% total earnings</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable styles={{ body: { padding: '20px' } }} style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Pending Review</span>}
              value={stats?.pendingOrders ?? 0}
              prefix={<FireOutlined style={{ color: '#f59e0b', marginRight: '8px' }} />}
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
            <p style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, margin: '8px 0 0' }}>Needs immediate action</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable styles={{ body: { padding: '20px' } }} style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>In Kitchen</span>}
              value={stats?.kitchenPreparing ?? 0}
              prefix={<ClockCircleOutlined style={{ color: '#9333ea', marginRight: '8px' }} />}
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
            <p style={{ fontSize: '11px', color: '#9333ea', fontWeight: 700, margin: '8px 0 0' }}>Baking & preparing</p>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card
        title={<span style={{ fontWeight: 800, fontSize: '16px' }}>Recent Customer Orders</span>}
        extra={
          <Button type="link" onClick={() => navigate('/orders')} style={{ fontWeight: 700, color: '#f43f5e' }}>
            View All Lifecycle ({recentOrders.length}) <RightOutlined />
          </Button>
        }
        style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}
      >
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="_id"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
