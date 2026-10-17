import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import Msg91PhoneVerify from '../../Components/Msg91PhoneVerify/Msg91PhoneVerify';
import { 
  TruckOutlined, 
  CoffeeOutlined, 
  ShopOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined, 
  CheckCircleOutlined, 
  TagOutlined, 
  CloseCircleOutlined,
  QrcodeOutlined,
  UserOutlined,
  WarningOutlined,
  MobileOutlined,
  MailOutlined,
  NotificationOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  MessageOutlined,
  CheckOutlined
} from '@ant-design/icons';
import '../Cart/Cart.scss';
import './Checkout.scss';

const Checkout = () => {
  const { cartItems, clearCart, subtotal, orderPreference, updateOrderPreference, savedAddresses, outlets } = useCart();
  const { user, updateUserProfile, updateOrderPreferences } = useAuth();
  const { placeOrder } = useOrders();

  const [isComplete, setIsComplete] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // 1. Primary Decision: Fulfillment Type (Delivery / Dine In / Pick Up)
  const [fulfillmentType, setFulfillmentType] = useState(() => {
    return orderPreference?.mode || user?.preferredFulfillment || 'delivery';
  });

  // 2. Separate Order Updates Channel Preference
  const [orderUpdateChannel, setOrderUpdateChannel] = useState(() => {
    return orderPreference?.orderUpdateChannel || user?.orderUpdateChannel || 'WHATSAPP_SMS';
  });

  // 3. Separate Receipt Preference Channel
  const [receiptChannel, setReceiptChannel] = useState(() => {
    return orderPreference?.receiptChannel || user?.receiptChannel || user?.receiveReceiptType || 'GMAIL_EMAIL';
  });

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Dynamic delivery fee calculation based on fulfillment type
  const deliveryFee = fulfillmentType === 'delivery' ? (subtotal > 0 ? 50 : 0) : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);

  // Selected saved address ID
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    return savedAddresses?.[0]?.id || 'new';
  });

  // Form states (preserved smoothly across dynamic mode switching)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: savedAddresses?.[0]?.phone || user?.phone || user?.phoneNumber || '',
    tableNumber: orderPreference?.tableNumber || '',
    guestCount: orderPreference?.guestCount || '',
    pickupBranch: orderPreference?.pickupBranch || 'Flagship Bakery - Downtown',
    addressLine: savedAddresses?.[0]?.addressLine || '',
    state: savedAddresses?.[0]?.state || '',
    country: savedAddresses?.[0]?.country || 'United States',
    pincode: savedAddresses?.[0]?.pincode || '',
    locationLink: savedAddresses?.[0]?.locationLink || '',
    cakeMessage: '',
    specialInstructions: ''
  });

  useEffect(() => {
    updateOrderPreference({
      mode: fulfillmentType,
      orderUpdateChannel,
      receiptChannel,
    });
  }, [fulfillmentType, orderUpdateChannel, receiptChannel]);

  if (!user) return <Navigate to="/signin" replace />;

  if (isComplete) return (
    <main className="shop-page empty-cart">
      <div className="success-banner">
        <CheckCircleOutlined style={{ fontSize: '4.8rem', color: '#ff4081' }} />
        <p className="eyebrow">Order Confirmed</p>
        <h1>Thank you for your order!</h1>
        <p>We have received your order and our master bakers are preparing your fresh treats.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="shop-button">View My Orders & Live Status</Link>
          <Link to="/menu" className="shop-button" style={{ background: '#f1f5f9', color: '#334155' }}>Order More</Link>
        </div>
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

  const handleSelectFulfillment = (mode) => {
    setFulfillmentType(mode);
    updateOrderPreference({ mode });
    if (updateOrderPreferences) {
      updateOrderPreferences({ mode, orderUpdateChannel, receiptChannel });
    }
  };

  const handleSelectUpdateChannel = (channel) => {
    setOrderUpdateChannel(channel);
    updateOrderPreference({ orderUpdateChannel: channel });
    if (updateOrderPreferences) {
      updateOrderPreferences({ mode: fulfillmentType, orderUpdateChannel: channel, receiptChannel });
    }
  };

  const handleSelectReceiptChannel = (channel) => {
    setReceiptChannel(channel);
    updateOrderPreference({ receiptChannel: channel });
    if (updateOrderPreferences) {
      updateOrderPreferences({ mode: fulfillmentType, orderUpdateChannel, receiptChannel: channel });
    }
  };

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

  const [pendingOrderDetails, setPendingOrderDetails] = useState(null);

  const handleSubmit = (event) => {
    if (event) event.preventDefault();

    let fulfillmentDetails = {};

    if (fulfillmentType === 'delivery') {
      const activeAddr = savedAddresses.find(a => a.id === selectedAddressId);
      fulfillmentDetails = {
        type: 'Delivery',
        address: activeAddr ? `${activeAddr.addressLine}, ${activeAddr.state}, ${activeAddr.country} - ${activeAddr.pincode}` : `${formData.addressLine}, ${formData.state}, ${formData.country} - ${formData.pincode}`,
        phone: formData.phone,
        locationLink: activeAddr?.locationLink || formData.locationLink || '',
        specialInstructions: formData.specialInstructions
      };
    } else if (fulfillmentType === 'dinein') {
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

    // Verification check for non-dinein order types: If user is not logged in or phone not verified
    if (fulfillmentType !== 'dinein' && (!user || !user.phoneVerified)) {
      setPendingOrderDetails(fulfillmentDetails);
      setIsVerifyModalOpen(true);
      return;
    }

    executeOrderPlacement(fulfillmentDetails);
  };

  const executeOrderPlacement = (fulfillmentDetails) => {
    // Save final customer preferences to profile if logged in
    if (user && updateOrderPreferences) {
      updateOrderPreferences({ mode: fulfillmentType, orderUpdateChannel, receiptChannel });
    }

    placeOrder({
      customerName: formData.name || user?.name || 'Table Guest',
      customerEmail: user?.email || 'guest@dinein.com',
      items: cartItems,
      subtotal,
      deliveryFee,
      discount: couponDiscount,
      total: grandTotal,
      orderPreference: {
        ...orderPreference,
        mode: fulfillmentType,
        orderUpdateChannel,
        receiptChannel
      },
      fulfillmentDetails,
      paymentMethod,
      couponCode: appliedCoupon?.code || '',
      cakeMessage: formData.cakeMessage,
      status: 'Confirmed'
    });

    clearCart();
    setIsComplete(true);
  };

  const handlePhoneVerifySuccess = (updatedUserData) => {
    updateUserProfile(updatedUserData);
    setIsVerifyModalOpen(false);
    if (pendingOrderDetails) {
      executeOrderPlacement(pendingOrderDetails);
      setPendingOrderDetails(null);
    }
  };

  const hasCustomCakes = cartItems.some(i => i.category === 'Customized Cakes' || i.type === 'custom_cake');

  return (
    <main className="shop-page">
      <header className="shop-heading">
        <p className="eyebrow">Checkout Workflow</p>
        <h1>Complete Your Order</h1>
      </header>

      {/* Mobile Verification Banner */}
      {!user?.phoneVerified && (
        <div className="cake-warning-banner" style={{ background: '#fff1f2', borderColor: '#fecaca', marginBottom: '20px' }}>
          <WarningOutlined style={{ fontSize: '2rem', color: '#dc2626' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <strong style={{ color: '#9f1239' }}>⚠️ Phone Verification Required:</strong>
              <span style={{ color: '#475569' }}> Mobile verification is required for order confirmation ({fulfillmentType === 'pickup' ? 'Pick Up' : fulfillmentType === 'dinein' ? 'Dine In' : 'Delivery'}).</span>
            </div>
            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(true)}
              style={{ background: '#f43f5e', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              Verify Phone via OTP
            </button>
          </div>
        </div>
      )}

      {hasCustomCakes && (
        <div className="cake-warning-banner">
          <WarningOutlined style={{ fontSize: '2rem', color: '#d97706' }} />
          <div>
            <strong>⚠️ Custom Cake Notice:</strong>
            <span> Custom theme cakes require advance baking (24–48 hours notice). Our head chef will contact you to verify design details.</span>
          </div>
        </div>
      )}

      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">

          {/* STEP 1: FULFILLMENT TYPE (PRIMARY DECISION) */}
          <section className="checkout-section-card">
            <div className="section-header-row">
              <h2>1. SELECT FULFILLMENT TYPE</h2>
              <span className="step-badge-pill">Step 1 of 5</span>
            </div>
            <p className="section-subtitle">How would you like to receive your order?</p>

            <div className="fulfillment-options-grid">
              <button
                type="button"
                className={`fulfillment-option-card ${fulfillmentType === 'delivery' ? 'active' : ''}`}
                onClick={() => handleSelectFulfillment('delivery')}
              >
                <div className="icon-wrapper">
                  <TruckOutlined style={{ fontSize: '2.4rem' }} />
                </div>
                <div className="card-info">
                  <h3>🚚 Delivery</h3>
                  <p>Fresh doorstep delivery</p>
                </div>
                {fulfillmentType === 'delivery' && <span className="check-badge"><CheckOutlined /></span>}
              </button>

              <button
                type="button"
                className={`fulfillment-option-card ${fulfillmentType === 'dinein' ? 'active' : ''}`}
                onClick={() => handleSelectFulfillment('dinein')}
              >
                <div className="icon-wrapper">
                  <CoffeeOutlined style={{ fontSize: '2.4rem' }} />
                </div>
                <div className="card-info">
                  <h3>🍽️ Dine In</h3>
                  <p>Enjoy at bakery café</p>
                </div>
                {fulfillmentType === 'dinein' && <span className="check-badge"><CheckOutlined /></span>}
              </button>

              <button
                type="button"
                className={`fulfillment-option-card ${fulfillmentType === 'pickup' ? 'active' : ''}`}
                onClick={() => handleSelectFulfillment('pickup')}
              >
                <div className="icon-wrapper">
                  <ShopOutlined style={{ fontSize: '2.4rem' }} />
                </div>
                <div className="card-info">
                  <h3>🛍️ Pick Up</h3>
                  <p>Counter takeaway</p>
                </div>
                {fulfillmentType === 'pickup' && <span className="check-badge"><CheckOutlined /></span>}
              </button>
            </div>
          </section>

          {/* STEP 2: DYNAMIC FULFILLMENT DETAILS (STRICT FIELD HIDING PER ORDER TYPE) */}
          <section className="checkout-section-card">
            <div className="section-header-row">
              <h2>2. {fulfillmentType === 'delivery' ? '🚚 Delivery Address & Phone' : fulfillmentType === 'dinein' ? '🍽️ Table Number & Phone' : '🛍️ Pick Up Location & Phone'}</h2>
              <span className="step-badge-pill">Step 2 of 5</span>
            </div>

            {/* ORDER TYPE: DELIVERY -> Delivery Address + Mobile Phone + Optional Google Link */}
            {fulfillmentType === 'delivery' && (
              <div className="form-fields-stack">
                <div className="saved-addresses-wrapper">
                  <label className="field-label">Select Saved Delivery Address:</label>
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
                    <label>Mobile Phone Number *</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Delivery Address Line *</label>
                  <input type="text" required value={formData.addressLine} onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })} />
                </div>

                {/* Optional Google Maps Link */}
                <div className="form-group">
                  <label>Google Maps Location Link (Optional) 📍</label>
                  <input 
                    type="url" 
                    placeholder="https://maps.google.com/?q=..." 
                    value={formData.locationLink} 
                    onChange={(e) => setFormData({ ...formData, locationLink: e.target.value })} 
                  />
                </div>
              </div>
            )}

            {/* ORDER TYPE: DINE IN -> Table Number + Mobile Phone + Guests */}
            {fulfillmentType === 'dinein' && (
              <div className="form-fields-stack">
                <div className="form-row">
                  <div className="form-group">
                    <label><QrcodeOutlined /> Table Number</label>
                    <input
                      type="text"
                      placeholder="Enter Table Number (e.g. 12)"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label><UserOutlined /> Number of Guests</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Enter Number of Guests (e.g. 2)"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Guest Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter Guest Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="Enter Mobile Phone (Optional)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ORDER TYPE: PICK UP -> Store Pickup Location + Mobile Phone Number ONLY */}
            {fulfillmentType === 'pickup' && (
              <div className="form-fields-stack">
                {outlets && outlets.length > 1 && (
                  <div className="form-group">
                    <label><EnvironmentOutlined /> Select Store Pickup Location *</label>
                    <select value={formData.pickupBranch} onChange={(e) => setFormData({ ...formData, pickupBranch: e.target.value })}>
                      {outlets.map((o, idx) => (
                        <option key={o.id || idx} value={o.name}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Mobile Phone Number ONLY *</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="Enter 10-digit mobile number for pickup OTP/SMS"
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                  />
                </div>
              </div>
            )}
          </section>

          {/* STEP 4: RECEIPT PREFERENCE */}
          <section className="checkout-section-card">
            <div className="section-header-row">
              <h2>4. RECEIPT PREFERENCE</h2>
              <span className="step-badge-pill">Step 4 of 5</span>
            </div>
            <p className="section-subtitle">How would you like your itemized digital invoice receipt delivered?</p>

            <div className="notification-options-grid">
              <button
                type="button"
                className={`channel-card ${receiptChannel === 'GMAIL_EMAIL' ? 'active priority' : ''}`}
                onClick={() => handleSelectReceiptChannel('GMAIL_EMAIL')}
              >
                <div className="channel-icon">
                  <MailOutlined style={{ fontSize: '1.8rem', color: '#ea4335' }} />
                </div>
                <div className="channel-info">
                  <h4>📧 Gmail / Email PDF</h4>
                  <p>Detailed digital invoice PDF sent directly to your email</p>
                </div>
                {receiptChannel === 'GMAIL_EMAIL' && <span className="check-badge"><CheckOutlined /></span>}
              </button>

              <button
                type="button"
                className={`channel-card ${receiptChannel === 'WHATSAPP_SMS' ? 'active' : ''}`}
                onClick={() => handleSelectReceiptChannel('WHATSAPP_SMS')}
              >
                <div className="channel-icon">
                  <MobileOutlined style={{ fontSize: '1.8rem', color: '#25d366' }} />
                </div>
                <div className="channel-info">
                  <h4>📱 WhatsApp & SMS Receipt</h4>
                  <p>Digital receipt link delivered via WhatsApp & SMS</p>
                </div>
                {receiptChannel === 'WHATSAPP_SMS' && <span className="check-badge"><CheckOutlined /></span>}
              </button>

              <button
                type="button"
                className={`channel-card ${receiptChannel === 'IN_APP' ? 'active' : ''}`}
                onClick={() => handleSelectReceiptChannel('IN_APP')}
              >
                <div className="channel-icon">
                  <FilePdfOutlined style={{ fontSize: '1.8rem', color: '#8b5cf6' }} />
                </div>
                <div className="channel-info">
                  <h4>📄 In-App Digital Invoice</h4>
                  <p>Download PDF invoice anytime in your order account</p>
                </div>
                {receiptChannel === 'IN_APP' && <span className="check-badge"><CheckOutlined /></span>}
              </button>

              <button
                type="button"
                className={`channel-card ${receiptChannel === 'PAPER_PRINT' ? 'active' : ''}`}
                onClick={() => handleSelectReceiptChannel('PAPER_PRINT')}
              >
                <div className="channel-icon">
                  <PrinterOutlined style={{ fontSize: '1.8rem', color: '#64748b' }} />
                </div>
                <div className="channel-info">
                  <h4>🖨️ Physical Paper Receipt</h4>
                  <p>Printed paper receipt attached with delivery/pickup</p>
                </div>
                {receiptChannel === 'PAPER_PRINT' && <span className="check-badge"><CheckOutlined /></span>}
              </button>
            </div>
          </section>

          {/* STEP 5: CAKE MESSAGE & PAYMENT */}
          <section className="checkout-section-card">
            <div className="section-header-row">
              <h2>5. CAKE MESSAGE & PAYMENT</h2>
              <span className="step-badge-pill">Step 5 of 5</span>
            </div>

            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label>Message to Write on Cake (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Happy Birthday Rahul! 🎉" 
                value={formData.cakeMessage} 
                onChange={(e) => setFormData({ ...formData, cakeMessage: e.target.value })} 
                maxLength={40}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Special Instructions / Allergies</label>
              <textarea 
                rows={2} 
                placeholder="e.g. Extra napkins, less sweet cream, ring doorbell on arrival..." 
                value={formData.specialInstructions} 
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })} 
              />
            </div>

            <label className="field-label" style={{ fontWeight: 800, marginBottom: '0.8rem', display: 'block' }}>Select Payment Method:</label>
            <div className="payment-options-grid">
              <label className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div>
                  <strong>💵 {fulfillmentType === 'dinein' ? 'Pay at Table / Counter' : 'Cash on Delivery (COD)'}</strong>
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
          <h2>Order Review & Summary</h2>
          
          <div className="checkout-items-mini-list">
            {cartItems.map((item) => (
              <div key={item.id} className="mini-item-row">
                <span>{item.name} (x{item.quantity})</span>
                <strong>₹{(item.priceValue * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          {/* Active Selections Badges */}
          <div className="active-preferences-summary-box">
            <div className="pref-summary-item">
              <span>Mode:</span>
              <strong>{fulfillmentType === 'dinein' ? '🍽️ Dine In' : fulfillmentType === 'pickup' ? '🛍️ Pick Up' : '🚚 Delivery'}</strong>
            </div>
            <div className="pref-summary-item">
              <span>Updates:</span>
              <strong>{orderUpdateChannel === 'WHATSAPP_SMS' ? '📱 WhatsApp & SMS' : orderUpdateChannel === 'SMS_ONLY' ? '💬 SMS Only' : orderUpdateChannel === 'IN_APP' ? '🛎️ In-App' : '📧 Email'}</strong>
            </div>
            <div className="pref-summary-item">
              <span>Receipt:</span>
              <strong>{receiptChannel === 'GMAIL_EMAIL' ? '📧 Email PDF' : receiptChannel === 'WHATSAPP_SMS' ? '📱 WhatsApp' : receiptChannel === 'PAPER_PRINT' ? '🖨️ Paper' : '📄 In-App'}</strong>
            </div>
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
              <strong>{fulfillmentType === 'delivery' ? `₹${deliveryFee.toFixed(2)}` : <span className="free-badge">FREE (₹0)</span>}</strong>
            </p>
            {appliedCoupon && <p className="discount-row"><span>Discount ({appliedCoupon.code})</span><strong>-₹{couponDiscount.toFixed(2)}</strong></p>}
            <div className="total-row"><span>Total Payable</span><strong>₹{grandTotal.toFixed(2)}</strong></div>
          </div>
        </aside>
      </div>

      {/* MSG91 Phone Verification Modal */}
      <Msg91PhoneVerify
        open={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        currentPhone={formData.phone || user?.phoneNumber || user?.phone || ''}
        onSuccess={handlePhoneVerifySuccess}
      />
    </main>
  );
};

export default Checkout;
