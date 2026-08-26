import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { 
  CloseOutlined, 
  TruckOutlined, 
  CoffeeOutlined, 
  ShopOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined, 
  LinkOutlined, 
  TagOutlined, 
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CheckOutlined
} from '@ant-design/icons';
import './Orders.scss';

const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

const getStatusSteps = (mode) => {
  if (mode === 'dinein') {
    return [
      { key: 'Confirmed', label: 'Confirmed', icon: '📝' },
      { key: 'Preparing', label: 'Baking & Preparing', icon: '👨‍🍳' },
      { key: 'Ready', label: 'Ready', icon: '✨' },
      { key: 'Served', label: 'Served at Table', icon: '🍽️' },
      { key: 'Completed', label: 'Completed', icon: '🎉' }
    ];
  }
  if (mode === 'pickup') {
    return [
      { key: 'Confirmed', label: 'Confirmed', icon: '📝' },
      { key: 'Preparing', label: 'Baking & Preparing', icon: '👨‍🍳' },
      { key: 'Ready', label: 'Ready for Pickup', icon: '🛍️' },
      { key: 'Picked Up', label: 'Picked Up', icon: '✅' },
      { key: 'Completed', label: 'Completed', icon: '🎉' }
    ];
  }
  // Default Delivery
  return [
    { key: 'Confirmed', label: 'Confirmed', icon: '📝' },
    { key: 'Preparing', label: 'Baking & Preparing', icon: '👨‍🍳' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'Delivered', label: 'Delivered', icon: '📦' },
    { key: 'Completed', label: 'Completed', icon: '🎉' }
  ];
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user } = useAuth();
  const { getCustomerOrders } = useOrders();

  if (!user) return <Navigate to="/signin" replace />;

  const customerOrders = getCustomerOrders(user.email);
  const visibleOrders = customerOrders.filter((order) => {
    const isFinished = order.status === 'Delivered' || order.status === 'Completed' || order.status === 'Served' || order.status === 'Picked Up';
    return activeTab === 'active' ? !isFinished : isFinished;
  });

  return (
    <main className="orders-page">
      <header>
        <p className="auth-kicker">My account</p>
        <h1>My Orders & Tracking</h1>
        <p>Track your active bakery orders live or revisit past sweet celebrations.</p>
      </header>

      <div className="order-tabs" role="tablist">
        <button 
          type="button"
          className={activeTab === 'active' ? 'active' : ''} 
          onClick={() => setActiveTab('active')} 
          role="tab"
        >
          Active Orders <span>{customerOrders.filter((order) => !['Delivered', 'Completed', 'Served', 'Picked Up'].includes(order.status)).length}</span>
        </button>
        <button 
          type="button"
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')} 
          role="tab"
        >
          Order History <span>{customerOrders.filter((order) => ['Delivered', 'Completed', 'Served', 'Picked Up'].includes(order.status)).length}</span>
        </button>
      </div>

      {visibleOrders.length ? (
        <div className="orders-list">
          {visibleOrders.map((order) => {
            const mode = order.orderPreference?.mode || 'delivery';
            const steps = getStatusSteps(mode);
            const currentStatus = order.status || 'Confirmed';
            const currentStepIdx = Math.max(0, steps.findIndex(s => s.key.toLowerCase() === currentStatus.toLowerCase()));

            return (
              <article className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div className="order-card-title-box">
                    <button 
                      type="button" 
                      className="order-id-badge"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <InfoCircleOutlined /> Order #{order.id}
                    </button>
                    <h2>{order.items.map((item) => item.name).join(', ')}</h2>
                    <p>Placed {formatDate(order.date)} • {order.items.reduce((q, i) => q + i.quantity, 0)} item(s)</p>
                  </div>

                  <div className="order-card-side">
                    <span className="order-mode-pill">
                      {mode === 'dinein' ? '🍽️ Dine In' : mode === 'pickup' ? '🛍️ Pickup' : '🚚 Delivery'}
                    </span>
                    <strong>₹{(order.total || 0).toFixed(2)}</strong>
                    <button 
                      type="button" 
                      className="view-modal-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details & Progress
                    </button>
                  </div>
                </div>

                {/* Live Status Progress Stepper */}
                <div className="order-progress-stepper">
                  <div className="stepper-track">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div key={step.key} className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                          <div className="step-node">
                            <span>{step.icon}</span>
                            {isCompleted && <CheckOutlined className="done-check" />}
                          </div>
                          <span className="step-label">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="orders-empty">
          <h2>{activeTab === 'active' ? 'No active orders.' : 'No previous orders yet.'}</h2>
          <p>{activeTab === 'active' ? 'When you place an order, its real-time preparation status will appear here.' : 'Completed orders will be stored here for your reference.'}</p>
          <Link to="/menu">Explore Cakes & Menu</Link>
        </section>
      )}

      {/* Detailed Order Breakdown Modal */}
      {selectedOrder && (
        <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close-modal-btn" onClick={() => setSelectedOrder(null)} aria-label="Close modal">
              <CloseOutlined />
            </button>

            {/* Modal Top Header */}
            <div className="modal-header">
              <span className="order-modal-badge">Order Breakdown</span>
              <h2>Order #{selectedOrder.id}</h2>
              <p className="order-date-str">Placed on {formatDate(selectedOrder.date)}</p>
              <span className={`modal-status-tag ${selectedOrder.status.toLowerCase()}`}>
                {selectedOrder.status}
              </span>
            </div>

            {/* Fulfillment & Schedule Info */}
            <div className="modal-section-box">
              <h3>Fulfillment & Details</h3>
              <div className="fulfillment-info-grid">
                <div>
                  <strong>Order Type</strong>
                  <p>
                    {selectedOrder.orderPreference?.mode === 'dinein' ? '🍽️ Café Dine In' : selectedOrder.orderPreference?.mode === 'pickup' ? '🛍️ Store Pick Up' : '🚚 Doorstep Delivery'}
                  </p>
                </div>
                <div>
                  <strong>Scheduled Schedule</strong>
                  <p>{selectedOrder.orderPreference?.formattedDate || 'Today'} ({selectedOrder.orderPreference?.formattedTime || 'ASAP'})</p>
                </div>
                {selectedOrder.fulfillmentDetails?.address && (
                  <div className="full-col">
                    <strong>Delivery Address</strong>
                    <p>{selectedOrder.fulfillmentDetails.address}</p>
                  </div>
                )}
                {selectedOrder.fulfillmentDetails?.tableNumber && (
                  <div>
                    <strong>Table Number</strong>
                    <p>{selectedOrder.fulfillmentDetails.tableNumber}</p>
                  </div>
                )}
                {selectedOrder.fulfillmentDetails?.pickupStore && (
                  <div className="full-col">
                    <strong>Pickup Store Branch</strong>
                    <p>{selectedOrder.fulfillmentDetails.pickupStore}</p>
                  </div>
                )}
                {selectedOrder.fulfillmentDetails?.phone && (
                  <div>
                    <strong>Contact Phone</strong>
                    <p><PhoneOutlined /> {selectedOrder.fulfillmentDetails.phone}</p>
                  </div>
                )}
                {selectedOrder.cakeMessage && (
                  <div className="full-col">
                    <strong>Cake Custom Message</strong>
                    <p className="cake-msg-highlight">“{selectedOrder.cakeMessage}”</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Breakdown Table */}
            <div className="modal-section-box">
              <h3>Ordered Items</h3>
              <div className="modal-items-table">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="modal-item-row">
                    <img src={item.image} alt={item.name} />
                    <div className="item-meta">
                      <strong>{item.name}</strong>
                      <span>{item.weight ? `Weight/Variant: ${item.weight}` : 'Standard Serving'}</span>
                    </div>
                    <div className="item-price-qty">
                      <span>x{item.quantity}</span>
                      <strong>₹{(item.priceValue * item.quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="modal-section-box">
              <h3>Payment Summary</h3>
              <div className="summary-calc-stack">
                <p><span>Subtotal</span><strong>₹{(selectedOrder.subtotal || 0).toFixed(2)}</strong></p>
                <p><span>Delivery Fee</span><strong>₹{(selectedOrder.deliveryFee || 0).toFixed(2)}</strong></p>
                {selectedOrder.discount > 0 && <p className="discount-row"><span>Coupon Discount</span><strong>-₹{selectedOrder.discount.toFixed(2)}</strong></p>}
                <div className="total-row"><span>Total Paid</span><strong>₹{(selectedOrder.total || 0).toFixed(2)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Orders;
