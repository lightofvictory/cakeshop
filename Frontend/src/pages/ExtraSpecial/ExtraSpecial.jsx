import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { partyEssentials } from '../../assets/partyEssentials';
import { Link } from 'react-router-dom';
import './ExtraSpecial.scss';

const categories = ["All", "Balloons", "Decorations", "Lights & Candles", "Sprays & Poppers", "Banners & Toppers", "Gifts & Flowers"];

const ExtraSpecial = () => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All" 
    ? partyEssentials 
    : partyEssentials.filter(item => item.category === activeCategory);

  return (
    <main className="extra-special-page">
      {/* Background Decor Ambient Circles */}
      <div className="extra-decor-circle-1" />
      <div className="extra-decor-circle-2" />

      <div className="extra-special-container">
        {/* Page Hero Header */}
        <section className="extra-hero-banner">
          <span className="party-badge">🎉 Celebration Add-ons</span>
          <h1 className="party-hero-title">
            Make Your Celebration <span>Extra Special!</span>
          </h1>
          <p className="party-hero-subtitle">
            Complete your birthday party, anniversary, or surprise celebration with our premium balloons, fairy lights, confetti poppers, magic candles, and floral decorations.
          </p>
        </section>

        {/* Category Pills Bar */}
        <div className="party-categories-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="party-products-grid">
          {filteredItems.map((item) => {
            const cartItem = cartItems.find((c) => c.id === item.id);

            return (
              <article key={item.id} className="sample-cake-card party-product-card">
                <div className="card-image-box">
                  <img src={item.image} alt={item.name} />
                  <span className="delivery-time-tag">{item.deliveryTime}</span>
                  <span className="rating-pill">{item.rating}</span>
                </div>

                <div className="card-content-box">
                  <span className="item-cat-label">{item.category}</span>
                  <h3 className="card-item-name">{item.name}</h3>
                  <p className="card-item-desc">{item.desc}</p>

                  <div className="card-price-offer-row">
                    <span className="card-discount-badge">{item.discount}</span>
                    <div className="card-price-group">
                      <strong className="card-current-price">{item.price}</strong>
                      <span className="card-original-price">{item.originalPrice}</span>
                    </div>
                  </div>

                  {cartItem ? (
                    <div className="menu-quantity-control">
                      <button onClick={() => updateQuantity(item.id, cartItem.quantity - 1)} aria-label={`Remove one ${item.name}`}>−</button>
                      <span>{cartItem.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, cartItem.quantity + 1)} aria-label={`Add one more ${item.name}`}>+</button>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      className="add-to-cart-button card-order-btn" 
                      onClick={() => addToCart({ ...item, weight: '1 Pc' })}
                    >
                      Add to cart
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <section className="party-callout-banner">
          <div>
            <h2>Ready to Celebrate? 🎂✨</h2>
            <p>Combine your favorite cakes & party essentials in one single delivery order!</p>
          </div>
          <Link to="/menu" className="browse-cakes-btn">Explore Gourmet Cakes →</Link>
        </section>
      </div>
    </main>
  );
};

export default ExtraSpecial;
