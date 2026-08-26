import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../Components/Header/Header';
import { assets } from '../../assets/assets.js';
import { useSettings } from '../../context/SettingsContext';
import './Home.scss';

const initialCakes = [
  {
    id: 'cake-1',
    name: 'Birthday Truffle Cake',
    image: assets.cake3,
    deliveryTime: '25 MINS',
    weight: '1 Kg',
    rating: '4.8',
    discount: '20% OFF',
    originalPrice: '₹899',
    price: '₹699',
    category: 'Cake Item',
    desc: 'Rich cocoa sponge layered with silky dark chocolate ganache.'
  },
  {
    id: 'cake-2',
    name: 'Royal Wedding Cake',
    image: assets.cake4,
    deliveryTime: '35 MINS',
    weight: '2 Kg',
    rating: '4.9',
    discount: '15% OFF',
    originalPrice: '₹2,899',
    price: '₹2,499',
    category: 'Cake Item',
    desc: 'Multi-tiered floral centerpiece crafted with gourmet cream.'
  },
  {
    id: 'cake-3',
    name: 'Custom Celebration Cake',
    image: assets.cake6,
    deliveryTime: '40 MINS',
    weight: '1.5 Kg',
    rating: '4.9',
    discount: '18% OFF',
    originalPrice: '₹1,599',
    price: '₹1,299',
    category: 'Cake Item',
    desc: 'Tailored flavors and bespoke hand-crafted artistic decorations.'
  },
  {
    id: 'cake-4',
    name: 'Dark Chocolate Mousse',
    image: assets.cake5,
    deliveryTime: '20 MINS',
    weight: '500g',
    rating: '4.7',
    discount: '25% OFF',
    originalPrice: '₹799',
    price: '₹599',
    category: 'Deserts Item',
    desc: 'Decadent dark cocoa mousse topped with chocolate curls.'
  },
  {
    id: 'cake-5',
    name: 'Exotic Fresh Fruit Cake',
    image: assets.cake2,
    deliveryTime: '25 MINS',
    weight: '1 Kg',
    rating: '4.8',
    discount: '20% OFF',
    originalPrice: '₹999',
    price: '₹799',
    category: 'Cake Item',
    desc: 'Light vanilla chiffon topped with fresh seasonal berries and fruits.'
  },
  {
    id: 'cake-6',
    name: 'Mini Dessert Supreme',
    image: assets.cake7,
    deliveryTime: '15 MINS',
    weight: '4 Pieces',
    rating: '4.6',
    discount: '15% OFF',
    originalPrice: '₹599',
    price: '₹499',
    category: 'Snakes Item',
    desc: 'Miniature indulgence cakes perfect for sweet cravings.'
  }
];

const defaultCategories = ['All', 'Cake Item', 'Snakes Item', 'Deserts Item', 'Salad Item', 'Pure Veg', 'Pasta Item', 'Cookies Item', 'Sweet Items'];

const Home = () => {
  const { settings } = useSettings();
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState(initialCakes);
  const [categoriesList, setCategoriesList] = useState(defaultCategories);
  const [selectedWeights, setSelectedWeights] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [customModalItem, setCustomModalItem] = useState(null);
  const [customWeightVal, setCustomWeightVal] = useState('6');

  useEffect(() => {
    const fetchBackendItems = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/items');
        if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const formatted = res.data.data.map((item) => ({
            id: item._id,
            name: item.name,
            image: item.image.startsWith('http') ? item.image : `http://localhost:3000/images/${item.image}`,
            deliveryTime: '25 MINS',
            weight: '1 Kg',
            rating: '4.9',
            discount: '15% OFF',
            originalPrice: `₹${Number(item.price) + 150}`,
            price: `₹${item.price}`,
            category: item.category,
            desc: item.description,
          }));

          setItems(formatted);

          const dynamicCats = Array.from(new Set(res.data.data.map((i) => i.category)));
          const combined = Array.from(new Set(['All', ...defaultCategories, ...dynamicCats]));
          setCategoriesList(combined);
        }
      } catch (err) {
        console.log('Backend server unreachable or no items yet, using initial items:', err.message);
      }
    };
    fetchBackendItems();
  }, []);

  const getScaledPrices = (item) => {
    const basePrice = parseInt(String(item.price).replace(/[^0-9]/g, '')) || 699;
    const baseOrig = parseInt(String(item.originalPrice).replace(/[^0-9]/g, '')) || (basePrice + 200);
    const weightKey = selectedWeights[item.id] || '1';

    if (weightKey === 'custom') {
      const customKg = parseFloat(customWeightVal) || 6;
      const mult = customKg * 0.85;
      return {
        price: `₹${Math.round(basePrice * mult).toLocaleString('en-IN')}`,
        originalPrice: `₹${Math.round(baseOrig * mult).toLocaleString('en-IN')}`,
        weightText: `${customKg} Kg (Custom)`
      };
    }

    const kg = parseFloat(weightKey);
    const mult = kg === 1 ? 1 : kg === 2 ? 1.85 : kg === 3 ? 2.7 : kg === 4 ? 3.5 : 4.3;
    return {
      price: `₹${Math.round(basePrice * mult).toLocaleString('en-IN')}`,
      originalPrice: `₹${Math.round(baseOrig * mult).toLocaleString('en-IN')}`,
      weightText: `${kg} Kg`
    };
  };

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter((item) => item.category === activeCategory || (activeCategory === 'Cakes' && item.category === 'Cake Item') || (activeCategory === 'Snacks' && item.category === 'Snakes Item'));

  return (
    <>
      {/* Top Announcement Bar from Home Settings */}
      {settings?.showPromo !== false && settings?.promoMarqueeText && (
        <div style={{ background: '#f43f5e', color: '#ffffff', textAlign: 'center', padding: '8px 16px', fontWeight: 800, fontSize: '13px' }}>
          {settings.promoMarqueeText}
        </div>
      )}

      {settings?.showHero !== false && <Header />}

      <main className="cakezone-home">
        <section className="about-block section-shell">
          <div className="about-image"><img src={assets.cake2} alt="Mr. Pastry celebration cake" /></div>
          <div className="about-copy">
            <p className="eyebrow">About us</p>
            <h2>Welcome to <span>{settings?.shopName || 'Mr. Pastry'}</span></h2>
            <p className="lead">Every celebration deserves a cake that feels as special as the moment itself.</p>
            <p>We bake fresh, beautiful cakes with carefully selected ingredients and flavours your guests will remember. From birthdays to the biggest day of your life, our kitchen is here for the sweet part.</p>
            <div className="benefit-grid">
              <div><b>✦</b><h3>Freshly Baked</h3><p>Made to order with quality ingredients.</p></div>
              <div><b>♥</b><h3>Made With Care</h3><p>Thoughtful details in every design.</p></div>
            </div>
          </div>
        </section>

        <section className="menu-block">
          <div className="section-shell">
            <div className="title-center">
              <p className="eyebrow">Menu & pricing</p>
              <h2>{settings?.menuTitle || 'Explore Our Category Selection'}</h2>
            </div>
            <div className="category-marquee" aria-label="Our menu categories">
              <div className="category-track">
                {categoriesList.map((category) => (
                  <button 
                    key={category} 
                    type="button"
                    className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="product-grid">
              {filteredItems.map((item) => {
                const scaled = getScaledPrices(item);
                const currentWeight = selectedWeights[item.id] || '1';

                return (
                  <article className="sample-cake-card" key={item.id}>
                    <div className="card-image-box">
                      <img src={item.image} alt={item.name} />
                      <span className="delivery-time-tag">{item.deliveryTime}</span>
                      <span className="rating-pill">{item.rating} ★</span>
                      <Link to="/menu" className="quick-add-btn" aria-label={`Add ${item.name} to cart`}>+</Link>
                    </div>
                    <div className="card-content-box">
                      <h3 className="card-item-name">{item.name}</h3>
                      <p className="card-item-desc">{item.desc}</p>
                      
                      <div className="custom-weight-dropdown-wrapper">
                        <button 
                          type="button" 
                          className="weight-dropdown-pill"
                          onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                        >
                          <span className="weight-text">
                            {currentWeight === 'custom' ? `${customWeightVal || 6} Kg` : `${currentWeight} Kg`}
                          </span>
                          <span className="pink-arrow">▾</span>
                        </button>

                        {openDropdownId === item.id && (
                          <>
                            <div className="weight-dropdown-overlay" onClick={() => setOpenDropdownId(null)} />
                            <ul className="weight-dropdown-menu">
                              {['1', '2', '3', '4', '5'].map((kg) => (
                                <li 
                                  key={kg}
                                  className={currentWeight === kg ? 'active' : ''}
                                  onClick={() => {
                                    setSelectedWeights(prev => ({ ...prev, [item.id]: kg }));
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <span>{kg} Kg</span>
                                  {currentWeight === kg && <span className="check-mark">✓</span>}
                                </li>
                              ))}
                              <li 
                                className={currentWeight === 'custom' ? 'active custom-option' : 'custom-option'}
                                onClick={() => {
                                  setCustomModalItem(item);
                                  setSelectedWeights(prev => ({ ...prev, [item.id]: 'custom' }));
                                  setOpenDropdownId(null);
                                }}
                              >
                                <span>Custom Weight (6+ Kg)...</span>
                              </li>
                            </ul>
                          </>
                        )}
                      </div>

                      <div className="card-price-offer-row">
                        <span className="card-discount-badge">{item.discount}</span>
                        <div className="card-price-group">
                          <strong className="card-current-price">{scaled.price}</strong>
                          <span className="card-original-price">{scaled.originalPrice}</span>
                        </div>
                      </div>
                      <Link to="/menu" className="card-order-btn">Order now</Link>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="center-action">
              <Link to="/menu" className="pink-button">Explore the full menu</Link>
            </div>
          </div>
        </section>

        {/* Custom Weight Modal */}
        {customModalItem && (
          <div className="custom-weight-modal-backdrop" onClick={() => setCustomModalItem(null)}>
            <div className="custom-weight-modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={() => setCustomModalItem(null)}>✕</button>
              <h3>Custom Weight & Type</h3>
              <p>Specify your custom weight requirement for <strong>{customModalItem.name}</strong>:</p>
              <div className="custom-input-group">
                <label htmlFor="custom-kg-input">Enter Weight in Kg:</label>
                <div className="input-row">
                  <input 
                    id="custom-kg-input"
                    type="number" 
                    min="1" 
                    max="50" 
                    step="0.5"
                    value={customWeightVal} 
                    onChange={(e) => setCustomWeightVal(e.target.value)} 
                  />
                  <span>Kg</span>
                </div>
              </div>
              <div className="modal-action-row">
                <button 
                  type="button" 
                  className="apply-custom-btn" 
                  onClick={() => setCustomModalItem(null)}
                >
                  Apply Custom Weight ({customWeightVal} Kg)
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="service-block section-shell">
          <div className="title-center">
            <p className="eyebrow">Our services</p>
            <h2>Made for Every Moment</h2>
          </div>
          <div className="service-grid">
            <article>
              <span>01</span>
              <h3>Birthday Cake</h3>
              <p>A little extra magic for their special day, in every size and flavour.</p>
              <Link to="/contact" className="service-enquire-btn">Enquire now</Link>
            </article>
            <article>
              <span>02</span>
              <h3>Wedding Cake</h3>
              <p>Elegant centrepieces designed around your style and celebration.</p>
              <Link to="/contact" className="service-enquire-btn">Enquire now</Link>
            </article>
            <article>
              <span>03</span>
              <h3>Custom Cake</h3>
              <p>Tell us your idea and we’ll turn it into something unforgettable.</p>
              <Link to="/contact" className="service-enquire-btn">Enquire now</Link>
            </article>
          </div>
        </section>

        {/* Testimonials */}
        {settings?.showTestimonials !== false && (
          <section className="testimonial-block">
            <div className="section-shell">
              <div className="title-center">
                <p className="eyebrow">Testimonial</p>
                <h2>Our Clients Say</h2>
              </div>
              <div className="quotes">
                <blockquote>
                  “The cake was beautiful, delicious, and the first thing everyone asked us about after the party.”
                  <footer>— Ananya R., Birthday celebration</footer>
                </blockquote>
                <blockquote>
                  “Mr. Pastry made our wedding cake exactly how we imagined it. Every detail was perfect.”
                  <footer>— Karan & Meera, Wedding</footer>
                </blockquote>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default Home;
