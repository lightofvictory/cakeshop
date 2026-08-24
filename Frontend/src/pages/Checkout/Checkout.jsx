import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { TruckOutlined, CoffeeOutlined, ShopOutlined, EnvironmentOutlined, PhoneOutlined, LinkOutlined, PlusOutlined, CheckCircleOutlined, TagOutlined, CloseCircleOutlined } from '@ant-design/icons';
import '../Cart/Cart.scss';
import './Checkout.scss';

const Checkout = () => {
  const { cartItems, clearCart, subtotal, orderPreference, openPreferenceModal, savedAddresses } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const [isComplete, setIsComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const mode = orderPreference?.mode || 'delivery';
  const deliveryFee = mode === 'delivery' ? (subtotal ? 99 : 0) : 0;
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
    tableNumber: '',
    addressLine: savedAddresses?.[0]?.addressLine || '',
    state: savedAddresses?.[0]?.state || '',
    country: savedAddresses?.[0]?.country || 'United States',
    pincode: savedAddresses?.[0]?.pincode || '',
    locationLink: savedAddresses?.[0]?.locationLink || '',
    cakeMessage: ''
  });

  if (!user) return <Navigate to="/signin" replace />;

  if (isComplete) return (
    <main className="shop-page empty-cart">
      <div className="success-banner">
        <CheckCircleOutlined style={{ fontSize: '4.8rem', color: '#ff4081' }} />
        <p className="eyebrow">Order Confirmed</p>
        <h1>Thank you for your order!</h1>
        <p>We have received your order and our master bakers are preparing your fresh treats.</p>
        <Link to="/orders" className="shop-button">View My Orders</Link>
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
        locationLink: activeAddr?.locationLink || formData.locationLink
      };
    } else if (mode === 'dinein') {
      fulfillmentDetails = {
        type: 'Dine In',
        tableNumber: formData.tableNumber,
        phone: formData.phone
      };
    } else {
      fulfillmentDetails = {
        type: 'Pick Up',
        phone: formData.phone,
        pickupStore: 'Mr. Pastry Flagship Bakery, 100 Cake Avenue'
      };
    }

    const tax = Math.round(subtotal * 0.05);
    const tip = 30;

    placeOrder({
      customerEmail: user.email,
      items: cartItems,
      subtotal,
      tax,
      discount: couponDiscount,
      tip,
      total: grandTotal,
      orderPreference,
      fulfillmentDetails,
      paymentMethod,
      couponCode: appliedCoupon?.code || '',
      cakeMessage: formData.cakeMessage
    });

    clearCart();
    setIsComplete(true);
  };

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        
        {/* Top Header & Schedule Banner */}
        <header className="checkout-header">
          <div className="header-text">
            <p className="eyebrow">Final Step</p>
            <h1>Complete Your Order</h1>
          </div>

          <div className="schedule-status-card">
            <div className="status-info">
              <span className="mode-badge">
                {mode === 'delivery' && <><TruckOutlined /> Doorstep Delivery</>}
                {mode === 'dinein' && <><CoffeeOutlined /> Bakery Dine In</>}
                {mode === 'pickup' && <><ShopOutlined /> Store Pick Up</>}
              </span>
              <span className="schedule-time">
                📅 {orderPreference?.formattedDate || 'Today'} • {orderPreference?.formattedTime || '10:00 AM - 12:00 PM'}
              </span>
            </div>
            <button type="button" className="change-pref-btn" onClick={openPreferenceModal}>
              Change Schedule
            </button>
          </div>
        </header>

        {/* 2-Column Main Layout */}
        <div className="checkout-main-grid">
          
          {/* Left Main Form */}
          <form className="checkout-form-column" onSubmit={handleSubmit}>
            
            {/* STEP 1: Customer Contact Details */}
            <section className="checkout-step-card">
              <div className="step-header">
                <span className="step-number">1</span>
                <div>
                  <h2>Contact Information</h2>
                  <p>Your details for order notifications and updates</p>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Full Name</label>
                  <input 
                    required 
                    type="text"
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-field">
                  <label>Phone Number</label>
                  <input 
                    required 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </section>

            {/* STEP 2: Fulfillment Specific Details */}
            <section className="checkout-step-card">
              <div className="step-header">
                <span className="step-number">2</span>
                <div>
                  {mode === 'delivery' && <h2>Delivery Address</h2>}
                  {mode === 'dinein' && <h2>Dine In Table Details</h2>}
                  {mode === 'pickup' && <h2>Store Pickup Instructions</h2>}
                  <p>Specify fulfillment details for your order</p>
                </div>
              </div>

              {/* Delivery Address Selector */}
              {mode === 'delivery' && (
                <div className="address-section">
                  {savedAddresses && savedAddresses.length > 0 && (
                    <div className="address-cards-grid">
                      {savedAddresses.map((addr) => (
                        <div 
                          key={addr.id} 
                          className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                          onClick={() => handleSelectAddress(addr)}
                        >
                          <div className="card-header">
                            <span className="addr-title"><EnvironmentOutlined /> {addr.title || 'Saved Address'}</span>
                            {selectedAddressId === addr.id && <CheckCircleOutlined className="check-icon" />}
                          </div>
                          <p className="addr-line">{addr.addressLine}</p>
                          <p className="addr-sub">{addr.state}, {addr.country} - {addr.pincode}</p>
                          <p className="addr-phone"><PhoneOutlined /> {addr.phone}</p>
                        </div>
                      ))}

                      <div 
                        className={`address-card add-card ${selectedAddressId === 'new' ? 'selected' : ''}`}
                        onClick={() => setSelectedAddressId('new')}
                      >
                        <PlusOutlined className="plus-icon" />
                        <strong>Enter Custom Address</strong>
                        <p>Deliver to a new address</p>
                      </div>
                    </div>
                  )}

                  {(selectedAddressId === 'new' || !savedAddresses.length) && (
                    <div className="custom-fields-wrapper">
                      <div className="form-field full-width">
                        <label>Street Address Line</label>
                        <input 
                          required 
                          type="text"
                          value={formData.addressLine} 
                          onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                          placeholder="House number, street name, apartment / suite"
                        />
                      </div>

                      <div className="form-row-2">
                        <div className="form-field">
                          <label>State / Region</label>
                          <input 
                            required 
                            type="text"
                            value={formData.state} 
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="State"
                          />
                        </div>
                        <div className="form-field">
                          <label>Country</label>
                          <input 
                            required 
                            type="text"
                            value={formData.country} 
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-field">
                          <label>Pincode / Zip Code</label>
                          <input 
                            required 
                            type="text"
                            value={formData.pincode} 
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            placeholder="90210"
                          />
                        </div>
                        <div className="form-field">
                          <label>Google Maps Link <small>(Optional)</small></label>
                          <input 
                            type="url"
                            value={formData.locationLink} 
                            onChange={(e) => setFormData({ ...formData, locationLink: e.target.value })}
                            placeholder="https://maps.google.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dine In Table No */}
              {mode === 'dinein' && (
                <div className="form-field full-width">
                  <label>Bakery Table Number</label>
                  <input 
                    required 
                    type="text"
                    value={formData.tableNumber} 
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    placeholder="e.g. Table #04"
                  />
                </div>
              )}

              {/* Pick Up Info */}
              {mode === 'pickup' && (
                <div className="pickup-box">
                  <ShopOutlined style={{ fontSize: '3rem', color: '#ff4081' }} />
                  <div>
                    <h4>Mr. Pastry Main Bakery Store</h4>
                    <p>100 Cake Avenue, Gourmet District, City Center</p>
                    <small>Your order will be packaged fresh for quick counter pickup.</small>
                  </div>
                </div>
              )}
            </section>

            {/* STEP 3: Cake Custom Message */}
            <section className="checkout-step-card">
              <div className="step-header">
                <span className="step-number">3</span>
                <div>
                  <h2>Cake Customization</h2>
                  <p>Add a personalized message written on your cake</p>
                </div>
              </div>

              <div className="form-field full-width">
                <label>Message on Cake <small>(Optional)</small></label>
                <input 
                  type="text"
                  value={formData.cakeMessage} 
                  onChange={(e) => setFormData({ ...formData, cakeMessage: e.target.value })}
                  placeholder="e.g. Happy Birthday Ananya! 🎂"
                />
              </div>
            </section>

            {/* STEP 4: Payment Selection */}
            <section className="checkout-step-card">
              <div className="step-header">
                <span className="step-number">4</span>
                <div>
                  <h2>Payment Method</h2>
                  <p>Choose your preferred payment option</p>
                </div>
              </div>

              <div className="payment-options-grid">
                <div 
                  className={`payment-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="radio-circle"></div>
                  <div>
                    <strong>Cash on Delivery / Pay at Counter</strong>
                    <p>Pay when your order arrives or at pickup</p>
                  </div>
                </div>

                <div 
                  className={`payment-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <div className="radio-circle"></div>
                  <div>
                    <strong>UPI / QR Code Payment</strong>
                    <p>Instant UPI payment via Google Pay, PhonePe, Paytm</p>
                  </div>
                </div>
              </div>
            </section>

            <button type="submit" className="submit-order-btn-desktop">
              Place Order • ₹{grandTotal.toFixed(2)}
            </button>
          </form>

          {/* Right Sticky Order Summary Sidebar */}
          <aside className="checkout-summary-column">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item-row">
                    <img src={item.image} alt={item.name} className="item-thumb" />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity} × {item.price}</p>
                    </div>
                    <span className="item-total">₹{(item.priceValue * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="coupon-box-wrapper">
                <label><TagOutlined /> Apply Coupon Code</label>
                {appliedCoupon ? (
                  <div className="applied-coupon-pill">
                    <div>
                      <strong><CheckCircleOutlined /> {appliedCoupon.code}</strong>
                      <span>Saved ₹{appliedCoupon.discountAmount.toFixed(2)} ({appliedCoupon.description})</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="remove-coupon-btn">Remove</button>
                  </div>
                ) : (
                  <>
                    <div className="coupon-input-group">
                      <input 
                        type="text" 
                        placeholder="Enter code (e.g. PASTRY10)" 
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError('');
                        }}
                      />
                      <button type="button" onClick={() => handleApplyCoupon()}>Apply</button>
                    </div>
                    {couponError && <p className="coupon-error-msg">{couponError}</p>}

                    <div className="coupon-chips">
                      <span onClick={() => handleApplyCoupon('PASTRY10')}>🏷️ PASTRY10 (10% OFF)</span>
                      <span onClick={() => handleApplyCoupon('CAKE200')}>🏷️ CAKE200 (₹200 OFF)</span>
                    </div>
                  </>
                )}
              </div>

              <div className="cost-breakdown">
                <div className="cost-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                {mode === 'delivery' && (
                  <div className="cost-row">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                )}

                {mode !== 'delivery' && (
                  <div className="cost-row free">
                    <span>Fulfillment Fee</span>
                    <span>FREE</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="cost-row discount">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="cost-row grand-total">
                  <span>Total Payable</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="button" 
                className="place-order-btn" 
                onClick={(e) => {
                  const form = document.querySelector('.checkout-form-column');
                  if (form) form.requestSubmit();
                }}
              >
                Confirm & Place Order • ₹{grandTotal.toFixed(2)}
              </button>

              <Link to="/cart" className="back-cart-link">← Modify Cart Items</Link>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
};

export default Checkout;
