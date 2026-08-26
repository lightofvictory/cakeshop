import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { 
  TruckOutlined, 
  CoffeeOutlined, 
  ShopOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined, 
  LinkOutlined, 
  PlusOutlined, 
  CheckCircleOutlined, 
  TagOutlined, 
  CloseCircleOutlined,
  QrcodeOutlined,
  UserOutlined,
  EditOutlined,
  WarningOutlined
} from '@ant-design/icons';
import '../Cart/Cart.scss';
import './Checkout.scss';

const Checkout = () => {
  const { cartItems, clearCart, subtotal, deliveryFee, orderPreference, openPreferenceModal, savedAddresses } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const [isComplete, setIsComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const mode = orderPreference?.mode || 'delivery';
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);

  // Selected saved address ID or 'new'
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    return savedAddresses?.[0]?.id || 'new';
  });

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: savedAddresses?.[0]?.phone || '',
    tableNumber: orderPreference?.tableNumber || 'Table #1',
    guestCount: orderPreference?.guestCount || 2,
    pickupBranch: orderPreference?.pickupBranch || 'Flagship Bakery - Downtown',
    addressLine: savedAddresses?.[0]?.addressLine || '',
    state: savedAddresses?.[0]?.state || '',
    country: savedAddresses?.[0]?.country || 'United States',
    pincode: savedAddresses?.[0]?.pincode || '',
    locationLink: savedAddresses?.[0]?.locationLink || '',
    cakeMessage: '',
    specialInstructions: ''
  });

  if (!user) return <Navigate to="/signin" replace />;

  if (isComplete) return (
    <main className="shop-page empty-cart">
      <div className="success-banner">
        <CheckCircleOutlined style={{ fontSize: '4.8rem', color: '#ff4081' }} />
        <p className="eyebrow">Order Confirmed</p>
        <h1>Thank you for your order!</h1>
        <p>We have received your order and our master bakers are preparing your fresh treats.</p>
        <Link to="/orders" className="shop-button">View My Orders & Live Status</Link>
      </div>
    </main>
  );

  if (!cartItems.length) return (
    <main className="shop-page empty-cart">
      <p className="eyebrow">Checkout</p>
      <h1>Your cart is empty.</h1>
      <Link to="/menu" className="shop-button">Explore Cakes</Link>
    </main>
  );

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData(prev => ({
      ...prev,
      phone: addr.phone || prev.phone,
      addressLine: addr.addressLine,
      state: addr.state,
      country: addr.country,
      pincode: addr.pincode,
      locationLink: addr.locationLink || ''
    }));
  };

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');

    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (code === 'PASTRY10') {
      const disc = Math.round(subtotal * 0.10);
      setAppliedCoupon({ code: 'PASTRY10', discountAmount: disc, description: '10% Discount' });
      setCouponInput('PASTRY10');
    } else if (code === 'CAKE200') {
      const disc = Math.min(subtotal, 200);
      setAppliedCoupon({ code: 'CAKE200', discountAmount: disc, description: 'Flat ₹200 Off' });
      setCouponInput('CAKE200');
    } else if (code === 'SWEET50') {
      const disc = Math.min(subtotal, 50);
      setAppliedCoupon({ code: 'SWEET50', discountAmount: disc, description: 'Flat ₹50 Off' });
      setCouponInput('SWEET50');
    } else {
      setCouponError('Invalid coupon code. Try PASTRY10 or CAKE200');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    let fulfillmentDetails = {};

    if (mode === 'delivery') {
      const activeAddr = savedAddresses.find(a => a.id === selectedAddressId);
      fulfillmentDetails = {
        type: 'Delivery',
        address: activeAddr ? `${activeAddr.addressLine}, ${activeAddr.state}, ${activeAddr.country} - ${activeAddr.pincode}` : `${formData.addressLine}, ${formData.state}, ${formData.country} - ${formData.pincode}`,
        phone: formData.phone,
        locationLink: activeAddr?.locationLink || formData.locationLink,
        specialInstructions: formData.specialInstructions
      };
    } else if (mode === 'dinein') {
      fulfillmentDetails = {
        type: 'Dine In',
        tableNumber: formData.tableNumber,
        guestCount: formData.guestCount,
        phone: formData.phone,
        specialInstructions: formData.specialInstructions
      };
    } else {
      fulfillmentDetails = {
        type: 'Pick Up',
        phone: formData.phone,
        pickupStore: formData.pickupBranch,
        specialInstructions: formData.specialInstructions
      };
    }

    const initialStatus = mode === 'delivery' ? 'Confirmed' : mode === 'dinein' ? 'Confirmed' : 'Confirmed';

    placeOrder({
      customerEmail: user.email,
      items: cartItems,
      subtotal,
      deliveryFee,
      discount: couponDiscount,
      total: grandTotal,
      orderPreference,
      fulfillmentDetails,
      paymentMethod,
      couponCode: appliedCoupon?.code || '',
      cakeMessage: formData.cakeMessage,
      status: initialStatus
    });

    clearCart();
    setIsComplete(true);
  };

  const hasCustomCakes = cartItems.some(i => i.category === 'Customized Cakes' || i.type === 'custom_cake');

  return (
    <main className="shop-page">
      <header className="shop-heading">
        <p className="eyebrow">Checkout</p>
        <h1>Complete Your Order</h1>
      </header>

      {/* Custom Cake Preparation Rule Warning */}
      {hasCustomCakes && (
        <div className="cake-warning-banner">
          <WarningOutlined style={{ fontSize: '2rem', color: '#d97706' }} />
          <div>
            <strong>⚠️ Custom Cake Notice:</strong>
            <span>Custom theme cakes require advance baking (24–48 hours notice). Our head chef will contact you to verify design details.</span>
          </div>
        </div>
      )}

      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">

          {/* Fulfillment Summary & Selector */}
          <section className="checkout-section-card">
            <div className="section-header-row">
              <h2>Order Fulfillment & Schedule</h2>
              <button type="button" className="change-pref-link" onClick={openPreferenceModal}>
                <EditOutlined /> Change Mode
              </button>
            </div>

            <div className="fulfillment-summary-box">
              <div className="summary-mode-badge">
                {mode === 'dinein' ? <CoffeeOutlined /> : mode === 'pickup' ? <ShopOutlined /> : <TruckOutlined />}
                <span>{mode === 'dinein' ? '🍽️ Dine In at Café' : mode === 'pickup' ? '🛍️ Store Pick Up' : '🚚 Doorstep Delivery'}</span>
              </div>
              <p className="summary-schedule-text">
                Scheduled for <strong>{orderPreference.formattedDate || 'Today'}</strong> at <strong>{orderPreference.formattedTime || 'ASAP'}</strong>
              </p>
            </div>
          </section>

          {/* Dynamic Required Details Section */}
          <section className="checkout-section-card">
            <h2>{mode === 'delivery' ? '🚚 Delivery Information' : mode === 'dinein' ? '🍽️ Café Table & Guest Details' : '🛍️ Store Pickup Details'}</h2>
            
            {mode === 'delivery' && (
              <div className="form-fields-stack">
                <div className="saved-addresses-wrapper">
                  <label className="field-label">Select Delivery Address:</label>
                  <div className="address-cards-grid">
                    {savedAddresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        className={`address-card ${selectedAddressId === addr.id ? 'active' : ''}`}
                        onClick={() => handleSelectAddress(addr)}
                      >
                        <div className="addr-header">
                          <strong>{addr.title || 'Address'}</strong>
                          {selectedAddressId === addr.id && <CheckCircleOutlined className="check-icon" />}
                        </div>
                        <p>{addr.addressLine}</p>
                        <p>{addr.state}, {addr.country} - {addr.pincode}</p>
                        <span className="phone"><PhoneOutlined /> {addr.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Delivery Address Line *</label>
                  <input type="text" required value={formData.addressLine} onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })} />
                </div>
              </div>
            )}

            {mode === 'dinein' && (
              <div className="form-fields-stack">
                <div className="form-row">
                  <div className="form-group">
                    <label><QrcodeOutlined /> Table Number *</label>
                    <select value={formData.tableNumber} onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}>
                      {Array.from({ length: 15 }, (_, i) => `Table #${i + 1}`).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="Scan QR Code">Scan QR Code on Table 📱</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label><UserOutlined /> Number of Guests *</label>
                    <select value={formData.guestCount} onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map(g => (
                        <option key={g} value={g}>{g} {g === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Phone Number *</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
            )}

            {mode === 'pickup' && (
              <div className="form-fields-stack">
                <div className="form-group">
                  <label><EnvironmentOutlined /> Store Pickup Location *</label>
                  <select value={formData.pickupBranch} onChange={(e) => setFormData({ ...formData, pickupBranch: e.target.value })}>
                    <option value="Flagship Bakery - Downtown">Flagship Bakery - 100 Cake Avenue, Downtown</option>
                    <option value="Westside Mall Branch">Westside Mall - Food Court, Level 2</option>
                    <option value="Eastside Café & Bakehouse">Eastside Bakehouse - 45 Sweet Street</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Contact Phone Number *</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
            )}
          </section>

          {/* Optional Cake Message & Special Requests */}
          <section className="checkout-section-card">
            <h2>🎂 Custom Message & Special Requests</h2>
            <div className="form-group">
              <label>Message to Write on Cake (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Happy Birthday Rahul! 🎉" 
                value={formData.cakeMessage} 
                onChange={(e) => setFormData({ ...formData, cakeMessage: e.target.value })} 
                maxLength={40}
              />
            </div>
            <div className="form-group">
              <label>Special Instructions / Allergies</label>
              <textarea 
                rows={2} 
                placeholder="e.g. Extra napkins, less sweet cream, ring doorbell on arrival..." 
                value={formData.specialInstructions} 
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })} 
              />
            </div>
          </section>

          {/* Payment Method */}
          <section className="checkout-section-card">
            <h2>Payment Method</h2>
            <div className="payment-options-grid">
              <label className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div>
                  <strong>💵 {mode === 'dinein' ? 'Pay at Table / Counter' : 'Cash on Delivery (COD)'}</strong>
                  <p>Pay when your order is served or delivered.</p>
                </div>
              </label>

              <label className={`payment-card ${paymentMethod === 'online' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                <div>
                  <strong>💳 Online Payment / UPI</strong>
                  <p>Pay instantly via Credit Card, Debit Card, or UPI.</p>
                </div>
              </label>
            </div>
          </section>

          <button type="submit" className="shop-button place-order-btn">
            Place Order • ₹{grandTotal.toFixed(2)}
          </button>
        </form>

        {/* Sidebar Summary Column */}
        <aside className="order-summary checkout-summary-sidebar">
          <h2>Order Summary</h2>
          
          <div className="checkout-items-mini-list">
            {cartItems.map((item) => (
              <div key={item.id} className="mini-item-row">
                <span>{item.name} (x{item.quantity})</span>
                <strong>₹{(item.priceValue * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div className="coupon-section-box">
            <label><TagOutlined /> Apply Discount Coupon</label>
            {!appliedCoupon ? (
              <div className="coupon-input-row">
                <input 
                  type="text" 
                  placeholder="Enter Code (e.g. PASTRY10)" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="button" onClick={() => handleApplyCoupon()}>Apply</button>
              </div>
            ) : (
              <div className="applied-coupon-pill">
                <div>
                  <strong>{appliedCoupon.code} Applied!</strong>
                  <span>{appliedCoupon.description}</span>
                </div>
                <button type="button" onClick={handleRemoveCoupon}><CloseCircleOutlined /></button>
              </div>
            )}
            {couponError && <p className="coupon-err">{couponError}</p>}
          </div>

          <div className="summary-calc-stack">
            <p><span>Subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></p>
            <p>
              <span>Delivery Fee</span>
              <strong>{mode === 'delivery' ? `₹${deliveryFee.toFixed(2)}` : <span className="free-badge">FREE (₹0)</span>}</strong>
            </p>
            {appliedCoupon && <p className="discount-row"><span>Discount ({appliedCoupon.code})</span><strong>-₹{couponDiscount.toFixed(2)}</strong></p>}
            <div className="total-row"><span>Total Payable</span><strong>₹{grandTotal.toFixed(2)}</strong></div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
