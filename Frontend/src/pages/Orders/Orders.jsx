import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { getFulfillmentFlowSteps, getStatusIndex } from '../../utils/fulfillmentFlows';
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
  CheckOutlined,
  UserOutlined,
  MobileOutlined,
  MessageOutlined
} from '@ant-design/icons';
import './Orders.scss';

const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user } = useAuth();
  const { getCustomerOrders } = useOrders();

  if (!user) return <Navigate to="/signin" replace />;

  const customerOrders = getCustomerOrders(user.email);
  const visibleOrders = customerOrders.filter((order) => {
    const isFinished = ['DELIVERED', 'COMPLETED', 'SERVED', 'PICKED_UP', 'CANCELLED', 'REJECTED'].includes((order.status || '').toUpperCase());
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
          Active Orders <span>{customerOrders.filter((order) => !['DELIVERED', 'COMPLETED', 'SERVED', 'PICKED_UP', 'CANCELLED', 'REJECTED'].includes((order.status || '').toUpperCase())).length}</span>
        </button>
        <button 
          type="button"
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')} 
          role="tab"
        >
          Order History <span>{customerOrders.filter((order) => ['DELIVERED', 'COMPLETED', 'SERVED', 'PICKED_UP', 'CANCELLED', 'REJECTED'].includes((order.status || '').toUpperCase())).length}</span>
        </button>
      </div>

      {visibleOrders.length ? (
        <div className="orders-list">
          {visibleOrders.map((order) => {
            const rawType = order.orderType || order.orderPreference?.mode || 'DELIVERY';
            const steps = getFulfillmentFlowSteps(rawType);
            const currentStatus = order.status || 'ORDER_PLACED';
            const currentStepIdx = getStatusIndex(steps, currentStatus);

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
                    <h2>{(order.items || []).map((item) => item.name).join(', ')}</h2>
                    <p>Placed {formatDate(order.date)} • {(order.items || []).reduce((q, i) => q + (i.quantity || 1), 0)} item(s)</p>
                  </div>

                  <div className="order-card-side">
                    <span className="order-mode-pill">
                      {rawType.toUpperCase().includes('DINE') ? '🍽️ Dine In' : rawType.toUpperCase().includes('PICK') ? '🛍️ Pickup' : '🚚 Delivery'}
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
      {selectedOrder && (() => {
        const rawType = selectedOrder.orderType || selectedOrder.orderPreference?.mode || 'DELIVERY';
        const steps = getFulfillmentFlowSteps(rawType);
        const currentStepIdx = getStatusIndex(steps, selectedOrder.status);

        return (
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
                <span className={`modal-status-tag ${(selectedOrder.status || '').toLowerCase()}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Fulfillment & Details */}
              <div className="modal-section-box">
                <h3>Decoupled Sub-System Statuses</h3>
                <div className="fulfillment-info-grid" style={{ marginBottom: '1rem' }}>
                  <div>
                    <strong>Order Status</strong>
                    <span className="modal-status-tag" style={{ background: '#e0f2fe', color: '#0369a1', display: 'inline-block', marginTop: '4px' }}>
                      {selectedOrder.orderStatus || selectedOrder.status || 'PLACED'}
                    </span>
                  </div>
                  <div>
                    <strong>Kitchen / KOT Status</strong>
                    <span className="modal-status-tag" style={{ background: '#fef3c7', color: '#92400e', display: 'inline-block', marginTop: '4px' }}>
                      {selectedOrder.kitchenStatus || 'NOT_SENT'}
                    </span>
                  </div>
                  <div>
                    <strong>Fulfillment Status</strong>
                    <span className="modal-status-tag" style={{ background: '#f3e8ff', color: '#6b21a8', display: 'inline-block', marginTop: '4px' }}>
                      {selectedOrder.fulfillmentStatus || 'PENDING'}
                    </span>
                  </div>
                  <div>
                    <strong>Payment Status</strong>
                    <span className="modal-status-tag" style={{ background: selectedOrder.paymentStatus === 'PAID' ? '#dcfce7' : '#fee2e2', color: selectedOrder.paymentStatus === 'PAID' ? '#166534' : '#991b1b', display: 'inline-block', marginTop: '4px' }}>
                      {selectedOrder.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                <h3>Fulfillment & Details</h3>
                <div className="fulfillment-info-grid">
                  <div>
                    <strong>Order Channel / Source</strong>
                    <p>🌐 {selectedOrder.orderSource || 'ECOMMERCE'}</p>
                  </div>
                  <div>
                    <strong>Order Type</strong>
                    <p>
                      {rawType.toUpperCase().includes('DINE') ? '🍽️ Café Dine In' : rawType.toUpperCase().includes('PICK') ? '🛍️ Store Pick Up' : '🚚 Doorstep Delivery'}
                    </p>
                  </div>
                  <div>
                    <strong>Schedule Date & Time</strong>
                    <p>{selectedOrder.pickupDate || selectedOrder.orderPreference?.formattedDate || 'Today'} ({selectedOrder.pickupTime || selectedOrder.orderPreference?.formattedTime || 'ASAP'})</p>
                  </div>

                  {/* Delivery Specific Address & Driver */}
                  {rawType.toUpperCase().includes('DELIVERY') && (
                    <>
                      <div className="full-col">
                        <strong>Delivery Address</strong>
                        <p>{selectedOrder.fulfillmentDetails?.address || selectedOrder.customerAddress || 'Customer Address Provided'}</p>
                      </div>
                      {selectedOrder.deliveryPartner?.name && (
                        <div className="full-col">
                          <strong>Assigned Delivery Partner</strong>
                          <p>🛵 {selectedOrder.deliveryPartner.name} ({selectedOrder.deliveryPartner.phone || 'Contact Driver'})</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Dine-In Specific Table & Guest Count */}
                  {rawType.toUpperCase().includes('DINE') && (
                    <>
                      <div>
                        <strong>Table Number</strong>
                        <p>🪑 {selectedOrder.tableNumber || selectedOrder.fulfillmentDetails?.tableNumber || 'Table #1'}</p>
                      </div>
                      <div>
                        <strong>Guest Count</strong>
                        <p>👥 {selectedOrder.guestCount || selectedOrder.fulfillmentDetails?.guestCount || 2} Guests</p>
                      </div>
                    </>
                  )}

                  {/* Pick-Up Specific Branch */}
                  {rawType.toUpperCase().includes('PICK') && (
                    <div className="full-col">
                      <strong>Pickup Store Branch</strong>
                      <p>📍 {selectedOrder.pickupBranch || selectedOrder.fulfillmentDetails?.pickupStore || 'Flagship Bakery - Downtown'}</p>
                    </div>
                  )}

                  <div>
                    <strong>Order Updates Alert</strong>
                    <p>📱 {selectedOrder.orderUpdateChannel === 'SMS' ? 'SMS Only' : 'WhatsApp & SMS'}</p>
                  </div>
                  <div>
                    <strong>Receipt Format</strong>
                    <p>📄 {selectedOrder.receiptChannel || 'WhatsApp'}</p>
                  </div>

                  {selectedOrder.cakeMessage && (
                    <div className="full-col">
                      <strong>Cake Custom Message</strong>
                      <p className="cake-msg-highlight">“{selectedOrder.cakeMessage}”</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status History Timeline */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="modal-section-box">
                  <h3>Status History Timeline</h3>
                  <div className="status-history-list">
                    {selectedOrder.statusHistory.map((log, index) => (
                      <div key={index} className="history-log-item">
                        <span className="log-dot"></span>
                        <div className="log-content">
                          <strong>{log.status}</strong>
                          <span className="log-time">{formatDate(log.timestamp)}</span>
                          {log.note && <p className="log-note">{log.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Breakdown Table */}
              <div className="modal-section-box">
                <h3>Ordered Items</h3>
                <div className="modal-items-table">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={item.id || idx} className="modal-item-row">
                      {item.image && <img src={item.image} alt={item.name} />}
                      <div className="item-meta">
                        <strong>{item.name}</strong>
                        <span>{item.weight ? `Weight/Variant: ${item.weight}` : 'Standard Serving'}</span>
                      </div>
                      <div className="item-price-qty">
                        <span>x{item.quantity || 1}</span>
                        <strong>₹{((item.priceValue || item.price || 0) * (item.quantity || 1)).toFixed(2)}</strong>
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
        );
      })()}
    </main>
  );
};

export default Orders;
