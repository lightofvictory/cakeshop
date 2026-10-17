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

              {/* Customer Info Box & Subsystem Badges */}
              <div className="customer-info-box">
                <div>
                  <h4 className="cust-name">{order.customer?.name || 'Guest Customer'}</h4>
                  <p className="cust-phone">
                    <PhoneOutlined /> {order.customer?.phone}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <Tag color="magenta" style={{ fontWeight: 800, fontSize: '10px' }}>
                    🌐 {order.orderSource || 'ECOMMERCE'}
                  </Tag>
                  <Tag color="purple" style={{ fontWeight: 800, fontSize: '10px' }}>
                    {order.orderType === 'DELIVERY' || order.fulfillmentType === 'DELIVERY' ? '🚚 Delivery' : order.orderType === 'PICKUP' || order.fulfillmentType === 'PICKUP' ? '🏪 Pickup' : '🍽️ Dine-In'}
                  </Tag>
                </div>
              </div>

              {/* Decoupled Sub-System Status Row */}
              <div style={{ display: 'flex', gap: '6px', margin: '6px 0 10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  Kitchen: {order.kitchenStatus || 'NOT_SENT'}
                </span>
                <span style={{ fontSize: '10px', background: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  Fulfill: {order.fulfillmentStatus || 'PENDING'}
                </span>
                <span style={{ fontSize: '10px', background: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fee2e2', color: order.paymentStatus === 'PAID' ? '#166534' : '#991b1b', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  Pay: {order.paymentStatus || 'PENDING'}
                </span>
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

                  {/* Conditional Status Action Buttons based on Fulfillment Type */}
                  {(order.status === 'NEW' || order.status === 'ORDER_PLACED') && (
                    <>
                      <Button
                        type="primary"
                        size="small"
                        style={{ backgroundColor: '#10b981', fontWeight: 700 }}
                        onClick={() => updateStatus(order._id, 'CONFIRMED')}
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

                  {(order.status === 'CONFIRMED' || order.status === 'ACCEPTED') && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#9333ea', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'PREPARING')}
                    >
                      Start Baking
                    </Button>
                  )}

                  {/* PREPARING -> READY step tailored by orderType */}
                  {order.status === 'PREPARING' && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#0284c7', fontWeight: 700 }}
                      onClick={() => {
                        const targetStatus = order.orderType === 'DELIVERY' 
                          ? 'READY_FOR_DISPATCH' 
                          : order.orderType === 'PICKUP' 
                          ? 'READY_FOR_PICKUP' 
                          : 'READY';
                        updateStatus(order._id, targetStatus);
                      }}
                    >
                      {order.orderType === 'DELIVERY' ? 'Ready for Dispatch' : order.orderType === 'PICKUP' ? 'Ready for Pickup' : 'Food Ready'}
                    </Button>
                  )}

                  {/* Delivery Flow Actions */}
                  {order.orderType === 'DELIVERY' && order.status === 'READY_FOR_DISPATCH' && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#4f46e5', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'OUT_FOR_DELIVERY')}
                    >
                      Dispatch & Out for Delivery
                    </Button>
                  )}

                  {order.orderType === 'DELIVERY' && (order.status === 'OUT_FOR_DELIVERY' || order.status === 'DRIVER_ASSIGNED' || order.status === 'PICKED_UP') && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#059669', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'COMPLETED')}
                    >
                      Mark Delivered & Complete
                    </Button>
                  )}

                  {/* Dine-In Flow Actions */}
                  {order.orderType === 'DINE_IN' && order.status === 'READY' && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#d97706', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'SERVED')}
                    >
                      Serve to Table
                    </Button>
                  )}

                  {order.orderType === 'DINE_IN' && order.status === 'SERVED' && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#0284c7', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'BILL_REQUESTED')}
                    >
                      Generate Bill
                    </Button>
                  )}

                  {order.orderType === 'DINE_IN' && (order.status === 'BILL_REQUESTED' || order.status === 'PAYMENT_COMPLETED') && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#059669', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'COMPLETED')}
                    >
                      Complete Dine-In
                    </Button>
                  )}

                  {/* Pickup Flow Actions */}
                  {order.orderType === 'PICKUP' && order.status === 'READY_FOR_PICKUP' && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#10b981', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'CUSTOMER_ARRIVED')}
                    >
                      Customer Arrived
                    </Button>
                  )}

                  {order.orderType === 'PICKUP' && (order.status === 'CUSTOMER_ARRIVED' || order.status === 'PICKED_UP') && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ backgroundColor: '#059669', fontWeight: 700 }}
                      onClick={() => updateStatus(order._id, 'COMPLETED')}
                    >
                      Mark Collected & Complete
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
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Current Status</span>
              <Tag color={getTagColor(selectedOrder.status)} style={{ fontWeight: 800, textTransform: 'uppercase', padding: '4px 12px' }}>
                {selectedOrder.status}
              </Tag>
            </div>

            {/* Fulfillment Specific Header */}
            <div style={{ background: '#fff0f3', border: '1px solid #f1dddf', padding: '14px', borderRadius: '12px' }}>
              <p style={{ fontWeight: 800, fontSize: '13px', color: '#2b1b1f', margin: 0 }}>
                Fulfillment: {selectedOrder.orderType === 'DELIVERY' ? '🚚 Doorstep Delivery' : selectedOrder.orderType === 'PICKUP' ? '🛍️ Store Pick Up' : '🍽️ Café Dine-In'}
              </p>
              {selectedOrder.tableNumber && <p style={{ fontSize: '12px', color: '#f50b5a', fontWeight: 700, margin: '4px 0 0' }}>🪑 Table: {selectedOrder.tableNumber} ({selectedOrder.guestCount || 2} Guests)</p>}
              {selectedOrder.pickupBranch && <p style={{ fontSize: '12px', color: '#475569', fontWeight: 600, margin: '4px 0 0' }}>📍 Branch: {selectedOrder.pickupBranch}</p>}
              {selectedOrder.pickupDate && <p style={{ fontSize: '12px', color: '#475569', fontWeight: 600, margin: '2px 0 0' }}>📅 Scheduled: {selectedOrder.pickupDate} ({selectedOrder.pickupTime || 'ASAP'})</p>}
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

            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>Status History Log</h4>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedOrder.statusHistory.map((log, index) => (
                    <div key={index} style={{ borderLeft: '2px solid #f43f5e', paddingLeft: '8px' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a' }}>{log.status}</strong>
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '6px' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {log.note && <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>{log.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
