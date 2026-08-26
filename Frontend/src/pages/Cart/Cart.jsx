import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { partyEssentials } from '../../assets/partyEssentials';
import { TruckOutlined, CoffeeOutlined, ShopOutlined, EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import './Cart.scss';

const Cart = () => {
  const { 
    cartItems, 
    itemCount, 
    removeFromCart, 
    subtotal, 
    deliveryFee, 
    updateQuantity, 
    addToCart,
    orderPreference,
    openPreferenceModal
  } = useCart();

  if (!cartItems.length) {
    return (
      <main className="shop-page empty-cart">
        <p className="eyebrow">Your basket</p>
        <h1>Your cart is empty.</h1>
        <p>Pick a cake from our freshly baked menu to get started.</p>
        <Link to="/menu" className="shop-button">Explore cakes</Link>
      </main>
    );
  }

  const mode = orderPreference?.mode || 'delivery';

  const getPreferenceSummaryText = () => {
    if (mode === 'dinein') {
      return `🍽️ Dine In • ${orderPreference.tableNumber || 'Table #1'} (${orderPreference.guestCount || 2} Guests)`;
    }
    if (mode === 'pickup') {
      return `🛍️ Store Pickup • ${orderPreference.pickupBranch || 'Downtown Flagship Store'}`;
    }
    return `🚚 Home Delivery • Doorstep`;
  };

  return (
    <main className="shop-page">
      <header className="shop-heading">
        <p className="eyebrow">Your basket</p>
        <h1>Cart <span>({itemCount} items)</span></h1>
      </header>

      {/* Order Type Banner Bar */}
      <div className="cart-order-pref-banner">
        <div className="pref-banner-info">
          <div className="mode-icon">
            {mode === 'dinein' ? <CoffeeOutlined /> : mode === 'pickup' ? <ShopOutlined /> : <TruckOutlined />}
          </div>
          <div className="pref-details">
            <strong>{getPreferenceSummaryText()}</strong>
            <span>Scheduled for {orderPreference.formattedDate || 'Today'} ({orderPreference.formattedTime || 'ASAP'})</span>
          </div>
        </div>
        <button type="button" className="change-pref-btn" onClick={openPreferenceModal}>
          <EditOutlined /> Change Order Type
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-left-column">
          <section className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.weight ? `Weight / Variant: ${item.weight}` : 'Freshly made by Mr. Pastry'}</p>
                  {item.cakeMessage && <p className="cart-item-msg">Message: "{item.cakeMessage}"</p>}
                  <strong>₹{item.priceValue.toFixed(2)}</strong>
                </div>
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Remove one ${item.name}`}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Add one ${item.name}`}>+</button>
                </div>
                <button className="remove-button" onClick={() => removeFromCart(item.id)}>Remove</button>
              </article>
            ))}
          </section>

          {/* Party Essentials Recommended Add-ons Section */}
          <section className="cart-addons-section">
            <div className="cart-addons-header">
              <div>
                <h3>🎉 Complete Your Celebration!</h3>
                <p>Add party essentials like balloons, candles & cake toppers to your order</p>
              </div>
              <Link to="/extra-special" className="view-all-link">View All →</Link>
            </div>

            <div className="cart-addons-grid">
              {partyEssentials.filter(p => p.isRecommended).slice(0, 4).map((addon) => {
                const isAdded = cartItems.some(c => c.id === addon.id);

                return (
                  <div key={addon.id} className="cart-addon-card">
                    <img src={addon.image} alt={addon.name} />
                    <div className="cart-addon-details">
                      <strong>{addon.name}</strong>
                      <div className="cart-addon-price-row">
                        <span className="price">{addon.price}</span>
                        <span className="orig">{addon.originalPrice}</span>
                      </div>
                      <button 
                        type="button" 
                        className={`cart-addon-btn ${isAdded ? 'added' : ''}`}
                        onClick={() => addToCart({ ...addon, weight: '1 Pc' })}
                      >
                        {isAdded ? '✓ Added to Order' : '+ Add to Order'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="order-summary">
          <h2>Order summary</h2>
          <p><span>Order Type</span><strong className="summary-mode-text">{mode === 'dinein' ? '🍽️ Dine In' : mode === 'pickup' ? '🛍️ Pickup' : '🚚 Delivery'}</strong></p>
          <p><span>Subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></p>
          <p>
            <span>Delivery Fee</span>
            <strong>{mode === 'delivery' ? `₹${deliveryFee.toFixed(2)}` : <span className="free-badge">FREE (₹0)</span>}</strong>
          </p>
          <div><span>Total</span><strong>₹{(subtotal + deliveryFee).toFixed(2)}</strong></div>
          <Link to="/checkout" className="shop-button">Proceed to checkout</Link>
          <Link to="/menu" className="continue-link">← Continue shopping</Link>
        </aside>
      </div>
    </main>
  );
};

export default Cart;
