import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Table, Tag, Button, Input, Modal, Drawer, Form, Switch, Row, Col, Statistic, Space, Popconfirm } from 'antd';
import {
  UsergroupAddOutlined,
  SearchOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CrownOutlined,
  ShoppingOutlined,
  DollarOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const Customers = () => {
  const url = 'http://localhost:3000';
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    vipCount: 0,
    totalSpentAll: 0,
    avgSpentPerCust: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected customer for history drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCust, setEditingCust] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${url}/api/customers`);
      if (res.data && res.data.success) {
        setCustomers(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch customers directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 10000);
    return () => clearInterval(interval);
  }, []);

  const openDrawer = async (cust) => {
    setSelectedCustomer(cust);
    setDrawerLoading(true);
    try {
      const res = await axios.get(`${url}/api/orders`);
      if (res.data && res.data.success) {
        const custPhone = cust.phone.replace(/[^0-9]/g, '');
        const filtered = res.data.data.filter((o) => {
          const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
          return oPhone && oPhone.includes(custPhone);
        });
        setCustomerOrders(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    setFormLoading(true);
    try {
      if (editingCust) {
        const res = await axios.patch(`${url}/api/customers/${editingCust._id}`, values);
        if (res.data && res.data.success) {
          toast.success('Customer updated successfully!');
        }
      } else {
        const res = await axios.post(`${url}/api/customers`, values);
        if (res.data && res.data.success) {
          toast.success('Customer created successfully!');
        }
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingCust(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleVip = async (cust) => {
    try {
      const res = await axios.patch(`${url}/api/customers/${cust._id}`, {
        vipStatus: !cust.vipStatus,
      });
      if (res.data && res.data.success) {
        toast.success(`${cust.name} ${!cust.vipStatus ? 'marked as VIP! 👑' : 'removed from VIP list'}`);
        fetchCustomers();
      }
    } catch (err) {
      toast.error('Failed to update VIP status');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${url}/api/customers/${id}`);
      if (res.data && res.data.success) {
        toast.success('Customer deleted');
        fetchCustomers();
      }
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const query = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.phone || '').includes(query) ||
      (c.city || '').toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{name}</strong>
            {record.vipStatus && <Tag color="gold" icon={<CrownOutlined />}>VIP</Tag>}
          </div>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
            📞 {record.phone} {record.email ? `| ✉️ ${record.email}` : ''}
          </p>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'city',
      key: 'city',
      render: (city, record) => (
        <span style={{ fontSize: '12px', color: '#475569' }}>
          <EnvironmentOutlined style={{ color: '#f43f5e', marginRight: '4px' }} />
          {city || 'Local'} {record.pincode ? `(${record.pincode})` : ''}
        </span>
      ),
    },
    {
      title: 'Orders Placed',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      render: (ordersCount) => (
        <Tag color="blue" style={{ fontWeight: 800 }}>
          <ShoppingOutlined style={{ marginRight: '4px' }} /> {ordersCount || 0} Order(s)
        </Tag>
      ),
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (spent) => (
        <strong style={{ fontSize: '15px', color: '#0f172a', fontWeight: 900 }}>
          ₹{spent || 0}
        </strong>
      ),
    },
    {
      title: 'Last Order',
      dataIndex: 'lastOrderAt',
      key: 'lastOrderAt',
      render: (date) => (
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          {date ? new Date(date).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => openDrawer(record)} style={{ fontWeight: 700 }}>
            History
          </Button>
          <Button
            size="small"
            icon={<CrownOutlined />}
            style={{ color: record.vipStatus ? '#eab308' : '#64748b' }}
            onClick={() => toggleVip(record)}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCust(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Popconfirm title="Delete customer?" onConfirm={() => handleDelete(record._id)} okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="page-header-card">
        <div className="header-info">
          <span className="badge-pill">
            <UsergroupAddOutlined /> Customer Relationship System
          </span>
          <h2>Customer Directory & Profiles</h2>
          <p>Real-time list of customers automatically synced when orders are placed on Frontend.</p>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '12px', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)' }}
          onClick={() => {
            setEditingCust(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          + Add Customer
        </Button>
      </div>

      {/* Stats Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable styles={{ body: { padding: '20px' } }} style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Total Customers</span>}
              value={stats.totalCustomers}
              prefix={<UsergroupAddOutlined style={{ color: '#f43f5e', marginRight: '8px' }} />}
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable styles={{ body: { padding: '20px' } }} style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>VIP Buyers</span>}
              value={stats.vipCount}
              prefix={<CrownOutlined style={{ color: '#eab308', marginRight: '8px' }} />}
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable styles={{ body: { padding: '20px' } }} style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Total Customer Spend</span>}
              value={stats.totalSpentAll}
              prefix={<DollarOutlined style={{ color: '#10b981', marginRight: '8px' }} />}
              suffix="₹"
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable styles={{ body: { padding: '20px' } }} style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Avg Spend / Customer</span>}
              value={stats.avgSpentPerCust}
              prefix={<ShoppingOutlined style={{ color: '#9333ea', marginRight: '8px' }} />}
              suffix="₹"
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Directory Table */}
      <Card style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
        <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search by customer name, phone number, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '360px', borderRadius: '10px' }}
          />

          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        </Space>
      </Card>

      {/* Customer History Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 800, fontSize: '16px' }}>{selectedCustomer?.name} - Purchase History</span>}
        placement="right"
        styles={{ wrapper: { width: 480 } }}
        onClose={() => setSelectedCustomer(null)}
        open={Boolean(selectedCustomer)}
      >
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontWeight: 800, fontSize: '16px', margin: 0 }}>{selectedCustomer.name}</p>
              <p style={{ color: '#f43f5e', fontWeight: 700, margin: '4px 0 0' }}>📞 {selectedCustomer.phone}</p>
              {selectedCustomer.email && <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>✉️ {selectedCustomer.email}</p>}
              {selectedCustomer.address && <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>📍 {selectedCustomer.address}, {selectedCustomer.city}</p>}
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
                Order Receipts ({customerOrders.length})
              </h4>

              {drawerLoading ? (
                <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading order history...</p>
              ) : customerOrders.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>No past order history found for this contact number.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {customerOrders.map((order) => (
                    <div key={order._id} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <strong style={{ fontFamily: 'monospace' }}>{order.orderNumber}</strong>
                        <Tag color="purple">{order.status}</Tag>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx}>• {item.name} ×{item.quantity} (₹{item.price * item.quantity})</div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                        <span>Total Paid:</span>
                        <span style={{ color: '#f43f5e' }}>₹{order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Add / Edit Customer Modal */}
      <Modal
        title={<span style={{ fontWeight: 800, fontSize: '18px' }}>{editingCust ? 'Edit Customer Profile' : 'Add New Customer'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate} style={{ marginTop: '16px' }}>
          <Form.Item name="name" label={<span style={{ fontWeight: 800 }}>Customer Name *</span>} rules={[{ required: true }]}>
            <Input placeholder="e.g. Rahul Sharma" style={{ borderRadius: '10px' }} />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={12}>
              <Form.Item name="phone" label={<span style={{ fontWeight: 800 }}>Phone Number *</span>} rules={[{ required: true }]}>
                <Input placeholder="e.g. +919876543210" style={{ borderRadius: '10px' }} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="email" label={<span style={{ fontWeight: 800 }}>Email Address</span>}>
                <Input placeholder="e.g. rahul@gmail.com" style={{ borderRadius: '10px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={16}>
              <Form.Item name="address" label={<span style={{ fontWeight: 800 }}>Address</span>}>
                <Input placeholder="e.g. Flat 402, Sunshine Apartments" style={{ borderRadius: '10px' }} />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item name="city" label={<span style={{ fontWeight: 800 }}>City</span>}>
                <Input placeholder="e.g. Mumbai" style={{ borderRadius: '10px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="vipStatus" valuePropName="checked" label={<span style={{ fontWeight: 800 }}>VIP Member Tag</span>}>
            <Switch checkedChildren="VIP 👑" unCheckedChildren="Standard" />
          </Form.Item>

          <Form.Item name="notes" label={<span style={{ fontWeight: 800 }}>Notes / Preferences</span>}>
            <Input.TextArea rows={2} placeholder="e.g. Prefers eggless cakes / allergic to nuts" style={{ borderRadius: '10px' }} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: '8px', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              style={{ backgroundColor: '#f43f5e', borderRadius: '8px', fontWeight: 800, padding: '0 24px' }}
            >
              Save Customer
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
