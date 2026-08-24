import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { partyEssentials } from '../../assets/partyEssentials';
import './Cart.scss';

const Cart = () => {
  const { cartItems, itemCount, removeFromCart, subtotal, updateQuantity, addToCart } = useCart();
  const delivery = subtotal ? 99 : 0;

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

  return (
    <main className="shop-page">
      <header className="shop-heading">
        <p className="eyebrow">Your basket</p>
        <h1>Cart <span>({itemCount} items)</span></h1>
      </header>

      <div className="cart-layout">
        <div className="cart-left-column">
          <section className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.weight ? `Weight: ${item.weight}` : 'Freshly made by Mr. Pastry'}</p>
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
          <p><span>Subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></p>
          <p><span>Delivery</span><strong>₹{delivery.toFixed(2)}</strong></p>
          <div><span>Total</span><strong>₹{(subtotal + delivery).toFixed(2)}</strong></div>
          <Link to="/checkout" className="shop-button">Proceed to checkout</Link>
          <Link to="/menu" className="continue-link">← Continue shopping</Link>
        </aside>
      </div>
    </main>
  );
};

export default Cart;
