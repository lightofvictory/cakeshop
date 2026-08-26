import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Badge, Tag, Button, Row, Col } from 'antd';
import {
  AppstoreOutlined,
  PhoneOutlined,
  FileTextOutlined,
  RightOutlined,
} from '@ant-design/icons';

const columns = [
  { status: 'NEW', title: 'New Orders', color: '#f59e0b', bg: '#fffbeb' },
  { status: 'ACCEPTED', title: 'Accepted', color: '#3b82f6', bg: '#eff6ff' },
  { status: 'PREPARING', title: 'In Kitchen', color: '#9333ea', bg: '#faf5ff' },
  { status: 'READY', title: 'Ready for Dispatch', color: '#10b981', bg: '#ecfdf5' },
  { status: 'COMPLETED', title: 'Completed', color: '#059669', bg: '#f0fdf4' },
];

const PreparationBoard = () => {
  const url = 'http://localhost:3000';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${url}/api/orders`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load kitchen board');
    } finally {
      setLoading(false);
    }
  };

  const advanceStatus = async (id, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'NEW') nextStatus = 'ACCEPTED';
    else if (currentStatus === 'ACCEPTED') nextStatus = 'PREPARING';
    else if (currentStatus === 'PREPARING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'COMPLETED';

    if (!nextStatus) return;

    try {
      const res = await axios.patch(`${url}/api/orders/${id}/status`, { status: nextStatus });
      if (res.data && res.data.success) {
        toast.success(`Order advanced to ${nextStatus}!`);
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-card">
        <div className="header-info">
          <span className="badge-pill">
            <AppstoreOutlined /> Kitchen Operations
          </span>
          <h2>Kitchen Preparation Kanban Board</h2>
          <p>Track kitchen baking progress and order fulfillment flow column by column.</p>
        </div>
      </div>

      {/* Kanban Grid */}
      <Row gutter={[16, 16]}>
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);

          return (
            <Col xs={24} sm={12} md={8} lg={4} key={col.status} style={{ minWidth: '230px' }}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{col.title}</span>
                    <Badge count={colOrders.length} style={{ backgroundColor: col.color, fontWeight: 800 }} />
                  </div>
                }
                styles={{
                  header: { borderBottom: `2px solid ${col.color}`, backgroundColor: col.bg, borderRadius: '16px 16px 0 0' },
                  body: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' },
                }}
                style={{ borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '520px', backgroundColor: '#f8fafc' }}
              >
                {colOrders.length === 0 ? (
                  <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: '30px 0' }}>No orders in column</p>
                ) : (
                  colOrders.map((order) => (
                    <Card
                      key={order._id}
                      hoverable
                      size="small"
                      style={{ borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}
                      styles={{ body: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' } }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{order.orderNumber}</strong>
                        <Tag color="purple" style={{ fontSize: '9px', fontWeight: 800, margin: 0 }}>
                          {order.orderType === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}
                        </Tag>
                      </div>

                      <div>
                        <p style={{ fontWeight: 800, fontSize: '13px', margin: 0 }}>{order.customer?.name}</p>
                        <p style={{ fontSize: '11px', color: '#f43f5e', margin: 0, fontWeight: 700 }}>
                          <PhoneOutlined /> {order.customer?.phone}
                        </p>
                      </div>

                      <div style={{ backgroundColor: '#fafafa', padding: '8px', borderRadius: '8px', fontSize: '11px' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                            <span>• {item.name}</span>
                            <span style={{ color: '#f43f5e', fontWeight: 800 }}>×{item.quantity}</span>
                          </div>
                        ))}

                        {order.notes && (
                          <p style={{ color: '#92400e', margin: '4px 0 0', fontSize: '10px', fontStyle: 'italic' }}>
                            <FileTextOutlined /> "{order.notes}"
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                        <strong style={{ fontSize: '14px', fontWeight: 900 }}>₹{order.total}</strong>

                        {col.status !== 'COMPLETED' && (
                          <Button
                            type="primary"
                            size="small"
                            style={{ backgroundColor: col.color, fontWeight: 700, fontSize: '10px' }}
                            onClick={() => advanceStatus(order._id, order.status)}
                          >
                            Advance <RightOutlined />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default PreparationBoard;
