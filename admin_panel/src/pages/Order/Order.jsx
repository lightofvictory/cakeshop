import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Tag, Badge, Button, Drawer, Modal, Input } from 'antd';
import {
  ShoppingOutlined,
  BellOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  ClockCircleOutlined,
  TagOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const orderStatuses = [
  { key: 'ALL', label: 'All Orders', icon: <ShoppingOutlined /> },
  { key: 'NEW', label: 'New Orders', icon: <BellOutlined /> },
  { key: 'ACCEPTED', label: 'Accepted', icon: <CheckCircleOutlined /> },
  { key: 'PREPARING', label: 'In Kitchen', icon: <ClockCircleOutlined /> },
  { key: 'READY', label: 'Ready', icon: <TagOutlined /> },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: <CarOutlined /> },
  { key: 'COMPLETED', label: 'Completed', icon: <CheckCircleOutlined /> },
  { key: 'CANCELLED', label: 'Cancelled', icon: <CloseCircleOutlined /> },
];

const Order = () => {
  const url = 'http://localhost:3000';
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${url}/api/orders`);
      if (res.data && res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching orders from backend');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, reason = '') => {
    try {
      const res = await axios.patch(`${url}/api/orders/${id}/status`, {
        status,
        rejectionReason: reason,
      });
      if (res.data && res.data.success) {
        toast.success(`Order #${res.data.data.orderNumber} updated to ${status}!`);
        setShowRejectModal(false);
        setRejectReasonInput('');
        setOrderToReject(null);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'ALL') return true;
    if (selectedStatus === 'CANCELLED') return o.status === 'CANCELLED' || o.status === 'REJECTED';
    return o.status === selectedStatus;
  });

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;

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
      case 'CANCELLED':
      case 'REJECTED':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-card">
        <div className="header-info">
          <span className="badge-pill">
            <ShoppingOutlined /> Live Order Management
          </span>
          <h2>Customer Orders Lifecycle</h2>
          <p>Accept, prepare, track delivery, and fulfill customer orders in real time.</p>
        </div>

        {newOrdersCount > 0 && (
          <div style={{ background: '#f59e0b', color: 'white', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '12px', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
            <BellOutlined /> {newOrdersCount} NEW ORDER(S) NEED ATTENTION
          </div>
        )}
      </div>

      {/* Filter Tabs Bar */}
      <div className="filter-tabs-bar">
        {orderStatuses.map((st) => {
          const count =
            st.key === 'ALL'
              ? orders.length
              : st.key === 'CANCELLED'
              ? orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED').length
              : orders.filter((o) => o.status === st.key).length;

          const isSelected = selectedStatus === st.key;

          return (
            <button
              key={st.key}
              onClick={() => setSelectedStatus(st.key)}
              className={`tab-btn ${isSelected ? 'active' : ''}`}
            >
              <span>{st.icon}</span>
              <span>{st.label}</span>
              <Badge
                count={count}
                style={{
                  backgroundColor: isSelected ? '#ffffff' : '#f1f5f9',
                  color: isSelected ? '#f43f5e' : '#475569',
                  boxShadow: 'none',
                  fontWeight: 800,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
          Loading live orders from database...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '32px', margin: 0 }}>📥</p>
          <p style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>No orders found in this status category.</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Orders placed by customers on the Frontend will appear here automatically.</p>
        </div>
      ) : (
        <div className="orders-grid-container">
          {filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Top Row */}
              <div className="card-top-row">
                <div>
                  <span className="order-number">{order.orderNumber}</span>
                  <div className="order-time">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <Tag color={getTagColor(order.status)} style={{ fontWeight: 800, borderRadius: '20px', textTransform: 'uppercase', fontSize: '10px', padding: '2px 10px' }}>
                  {order.status}
                </Tag>
              </div>

              {/* Customer Info Box */}
              <div className="customer-info-box">
                <div>
                  <h4 className="cust-name">{order.customer?.name || 'Guest Customer'}</h4>
                  <p className="cust-phone">
                    <PhoneOutlined /> {order.customer?.phone}
                  </p>
                </div>
                <Tag color="purple" style={{ fontWeight: 800, fontSize: '10px' }}>
                  {order.orderType === 'DELIVERY' ? '🚚 Delivery' : order.orderType === 'PICKUP' ? '🏪 Pickup' : '🍽️ Dine-In'}
                </Tag>
              </div>

              {/* Items Summary Box */}
              <div className="items-summary-box">
                <p className="items-label">Ordered Items</p>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <span className="item-title">
                      • {item.name} <span style={{ color: '#f43f5e', fontWeight: 800 }}>×{item.quantity}</span>
                    </span>
                    <span className="item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}

                {order.notes && (
                  <div className="cake-note-box">
                    <FileTextOutlined style={{ marginRight: '4px' }} />
                    <span><strong>Note:</strong> "{order.notes}"</span>
                  </div>
                )}
              </div>

              {order.orderType === 'DELIVERY' && order.customer?.address && (
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }} className="truncate">
                  <EnvironmentOutlined /> {order.customer.address}, {order.customer.city}
                </p>
              )}

              {/* Card Footer Row */}
              <div className="card-footer-row">
                <div className="price-group">
                  <span className="label">Total Amount</span>
                  <p className="total-amount">₹{order.total}</p>
                </div>

                <div className="actions-group">
                  <Button size="small" onClick={() => setSelectedOrder(order)} style={{ fontWeight: 700 }}>
                    Details
                  </Button>

                  {order.status === 'NEW' && (
                    <>
                      <Button
                        type="primary"
                        size="small"
                        style={{ backgroundColor: '#10b981', fontWeight: 700 }}
                        onClick={() => updateStatus(order._id, 'ACCEPTED')}
                      >
                        Accept
                      </Button>
                      <Button
                        type="primary"
                        danger
                        size="small"
                        style={{ fontWeight: 700 }}
                        onClick={() => {
                          setOrderToReject(order);
                          setShowRejectModal(true);
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#9333ea', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'PREPARING')}
                    >
                      Start Baking
                    </Button>
                  )}

                  {order.status === 'PREPARING' && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#10b981', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'READY')}
                    >
                      Mark Ready
                    </Button>
                  )}

                  {order.status === 'READY' && order.orderType === 'DELIVERY' && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#4f46e5', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'OUT_FOR_DELIVERY')}
                    >
                      Dispatch
                    </Button>
                  )}

                  {(order.status === 'READY' || order.status === 'OUT_FOR_DELIVERY') && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#059669', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'COMPLETED')}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ant Design Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 800, fontSize: '16px' }}>{selectedOrder?.orderNumber} - Order Details</span>}
        placement="right"
        width={480}
        onClose={() => setSelectedOrder(null)}
        open={Boolean(selectedOrder)}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', display: 'flex', justify: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Current Order Status</span>
              <Tag color={getTagColor(selectedOrder.status)} style={{ fontWeight: 800, textTransform: 'uppercase', padding: '4px 12px' }}>
                {selectedOrder.status}
              </Tag>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>Customer Details</h4>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <p style={{ fontWeight: 800, fontSize: '14px', margin: 0 }}>{selectedOrder.customer?.name}</p>
                <p style={{ color: '#f43f5e', fontWeight: 700, margin: '4px 0 0' }}>📞 {selectedOrder.customer?.phone}</p>
                {selectedOrder.customer?.email && <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>✉️ {selectedOrder.customer.email}</p>}
                {selectedOrder.customer?.address && (
                  <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0', marginTop: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#334155', margin: 0 }}>Delivery Address:</p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{selectedOrder.customer.address}, {selectedOrder.customer.city} ({selectedOrder.customer.pincode})</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>Item Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '13px', margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Qty: {item.quantity} | ₹{item.price} each</p>
                      {item.customMessage && (
                        <p style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 700, margin: '4px 0 0' }}>✨ Custom Writing: "{item.customMessage}"</p>
                      )}
                    </div>
                    <strong style={{ fontWeight: 800 }}>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                <span>Delivery Fee</span>
                <span>₹{selectedOrder.deliveryFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '16px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <span>Total Amount</span>
                <span style={{ color: '#f43f5e' }}>₹{selectedOrder.total}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Reject Modal */}
      <Modal
        title={`Reject Order #${orderToReject?.orderNumber}?`}
        open={showRejectModal}
        onOk={() => updateStatus(orderToReject?._id, 'REJECTED', rejectReasonInput)}
        onCancel={() => setShowRejectModal(false)}
        okText="Confirm Reject"
        okButtonProps={{ danger: true }}
      >
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Please specify a reason for rejecting this customer order:</p>
        <Input.TextArea
          rows={3}
          value={rejectReasonInput}
          onChange={(e) => setRejectReasonInput(e.target.value)}
          placeholder="e.g. Out of stock / Kitchen closing early"
        />
      </Modal>
    </div>
  );
};

export default Order;
