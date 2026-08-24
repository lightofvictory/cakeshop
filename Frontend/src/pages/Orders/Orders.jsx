import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { CloseOutlined, TruckOutlined, CoffeeOutlined, ShopOutlined, EnvironmentOutlined, PhoneOutlined, LinkOutlined, TagOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './Orders.scss';

const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user } = useAuth();
  const { getCustomerOrders } = useOrders();

  if (!user) return <Navigate to="/signin" replace />;

  const customerOrders = getCustomerOrders(user.email);
  const visibleOrders = customerOrders.filter((order) => activeTab === 'active' ? order.status !== 'Delivered' : order.status === 'Delivered');

  return (
    <main className="orders-page">
      <header>
        <p className="auth-kicker">My account</p>
        <h1>My Orders</h1>
        <p>Track your current cakes and revisit your previous celebrations. Click any Order ID for full breakdown details.</p>
      </header>

      <div className="order-tabs" role="tablist">
        <button 
          type="button"
          className={activeTab === 'active' ? 'active' : ''} 
          onClick={() => setActiveTab('active')} 
          role="tab"
        >
          Active Orders <span>{customerOrders.filter((order) => order.status !== 'Delivered').length}</span>
        </button>
        <button 
          type="button"
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')} 
          role="tab"
        >
          Order History <span>{customerOrders.filter((order) => order.status === 'Delivered').length}</span>
        </button>
      </div>

      {visibleOrders.length ? (
        <div className="orders-list">
          {visibleOrders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <button 
                  type="button" 
                  className="order-id-badge"
                  onClick={() => setSelectedOrder(order)}
                  title="Click to view complete order details"
                >
                  <InfoCircleOutlined /> Order #{order.id}
                </button>
                <h2>{order.items.map((item) => item.name).join(', ')}</h2>
                <p>Placed {formatDate(order.date)} • {order.items.reduce((q, i) => q + i.quantity, 0)} item(s)</p>
              </div>

              <div className="order-card-side">
                <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                <strong>₹{(order.total || 0).toFixed(2)}</strong>
                <button 
                  type="button" 
                  className="view-modal-btn"
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="orders-empty">
          <h2>{activeTab === 'active' ? 'No active orders.' : 'No previous orders yet.'}</h2>
          <p>{activeTab === 'active' ? 'When you place an order, its preparation status will appear here.' : 'Delivered orders will be stored here for your reference.'}</p>
          <Link to="/menu">Explore Cakes</Link>
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
              <span className="order-modal-badge">Order Details</span>
              <h2>Order #{selectedOrder.id}</h2>
              <p className="order-date-str">Placed on {formatDate(selectedOrder.date)}</p>
              <span className={`modal-status-tag ${selectedOrder.status.toLowerCase()}`}>
                {selectedOrder.status}
              </span>
            </div>

            {/* Fulfillment & Schedule Info */}
            <div className="modal-section-box">
              <h3>Fulfillment & Schedule</h3>
              <div className="fulfillment-info-grid">
                <div>
                  <strong>Fulfillment Type</strong>
                  <p>
                    {selectedOrder.orderPreference?.mode === 'dinein' ? '☕ Bakery Dine In' : selectedOrder.orderPreference?.mode === 'pickup' ? '🏪 Store Pick Up' : '🚚 Doorstep Delivery'}
                  </p>
                </div>
                <div>
                  <strong>Scheduled Date & Time</strong>
                  <p>{selectedOrder.orderPreference?.formattedDate || 'Today'} ({selectedOrder.orderPreference?.formattedTime || 'Standard Time'})</p>
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
                {selectedOrder.fulfillmentDetails?.phone && (
                  <div>
                    <strong>Contact Phone</strong>
                    <p><PhoneOutlined /> {selectedOrder.fulfillmentDetails.phone}</p>
                  </div>
                )}
                {selectedOrder.fulfillmentDetails?.locationLink && (
                  <div>
                    <strong>Location Link</strong>
                    <p>
                      <a href={selectedOrder.fulfillmentDetails.locationLink} target="_blank" rel="noopener noreferrer">
                        <LinkOutlined /> View Map
                      </a>
                    </p>
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
              <h3>Ordered Cake Items</h3>
              <div className="modal-items-table">
                <div className="table-header">
                  <span>Item</span>
                  <span>Weight</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span>Total</span>
                </div>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="table-row">
                    <div className="item-col">
                      <div className="item-left-main">
                        <img src={item.image} alt={item.name} className="modal-item-thumb" />
                        <div>
                          <strong>{item.name}</strong>
                          <small>{item.category || 'Cake Special'}</small>
                        </div>
                      </div>
                      <strong className="item-cost mobile-only-cost">
                        ₹{((item.priceValue || parsePrice(item.price)) * item.quantity).toFixed(2)}
                      </strong>
                    </div>

                    <div className="row-meta-mobile">
                      <span className="weight-badge">{item.weight || '1 Kg'}</span>
                      <span className="qty-col">Qty: {item.quantity}</span>
                      <span className="unit-price-str">₹{(item.priceValue || parsePrice(item.price)).toFixed(2)} each</span>
                      <strong className="item-cost desktop-only-cost">₹{((item.priceValue || parsePrice(item.price)) * item.quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Price & Financial Breakdown */}
            <div className="modal-section-box financial-box">
              <h3>Financial Cost Breakdown</h3>
              <div className="breakdown-rows">
                <div className="b-row">
                  <span>Items Subtotal</span>
                  <span>₹{(selectedOrder.subtotal || calculateItemsTotal(selectedOrder.items)).toFixed(2)}</span>
                </div>
                <div className="b-row discount-row">
                  <span>Discount Applied <TagOutlined /></span>
                  <span>-₹{(selectedOrder.discount || 50).toFixed(2)}</span>
                </div>
                <div className="b-row">
                  <span>Govt. Tax & GST (5%)</span>
                  <span>₹{(selectedOrder.tax || Math.round(calculateItemsTotal(selectedOrder.items) * 0.05)).toFixed(2)}</span>
                </div>
                <div className="b-row">
                  <span>Baker / Driver Tip</span>
                  <span>₹{(selectedOrder.tip || 30).toFixed(2)}</span>
                </div>
                <div className="b-row">
                  <span>Fulfillment / Delivery Fee</span>
                  <span>{selectedOrder.orderPreference?.mode === 'delivery' ? '₹99.00' : 'FREE'}</span>
                </div>
                <div className="b-row grand-total-row">
                  <span>Grand Total Paid</span>
                  <strong>₹{selectedOrder.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
};

const parsePrice = (price) => Number(String(price).replace(/[^0-9.]/g, '')) || 0;
const calculateItemsTotal = (items) => items.reduce((t, i) => t + (i.priceValue || parsePrice(i.price)) * i.quantity, 0);

export default Orders;
