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

import MobileAppView from '../../Components/MobileAppView/MobileAppView';

const Home = () => {
  const { settings } = useSettings();
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [categoriesList, setCategoriesList] = useState(['All']);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeights, setSelectedWeights] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [customModalItem, setCustomModalItem] = useState(null);
  const [customWeightVal, setCustomWeightVal] = useState('6');

  useEffect(() => {
    const fetchBackendData = async () => {
      setLoading(true);
      try {
        const [itemsRes, catRes] = await Promise.all([
          axios.get('http://localhost:3000/api/items'),
          axios.get('http://localhost:3000/api/categories')
        ]);

        const dbItems = (itemsRes.data && itemsRes.data.success && Array.isArray(itemsRes.data.data)) ? itemsRes.data.data : [];
        const dbCats = (catRes.data && catRes.data.success && Array.isArray(catRes.data.data)) ? catRes.data.data : [];

        setDbCategories(dbCats);

        const formattedItems = dbItems.map((item) => {
          let imageUrl = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80';
          if (item.image) {
            if (item.image.startsWith('http') || item.image.startsWith('blob:') || item.image.startsWith('data:')) {
              imageUrl = item.image;
            } else {
              imageUrl = `http://localhost:3000/images/${item.image}`;
            }
          }

          let discountTag = item.discount || '';
          if (!discountTag) {
            if (item.offerType === 'FLAT' && item.flatAmount) {
              discountTag = `FLAT ₹${item.flatAmount} OFF`;
            } else if (item.offerPercentage) {
              discountTag = `${item.offerPercentage}% OFF`;
            }
          }

          const hasOffer = item.offerPrice && item.offerPrice < item.price;
          const displayPrice = hasOffer ? item.offerPrice : item.price;
          const displayOriginalPrice = item.originalPrice ? `₹${item.originalPrice}` : (hasOffer ? `₹${item.price}` : '');

          return {
            id: item._id || item.id,
            _id: item._id || item.id,
            name: item.name,
            image: imageUrl,
            deliveryTime: item.deliveryTime || '25 MINS',
            weight: item.weight || '1 Kg',
            rating: item.rating ? String(item.rating) : '4.8',
            discount: discountTag,
            badge: discountTag,
            originalPrice: displayOriginalPrice,
            price: `₹${displayPrice}`,
            priceValue: Number(displayPrice) || 0,
            category: item.category || 'Cake Item',
            desc: item.description || '',
          };
        });

        setItems(formattedItems);

        const dbCatNames = dbCats.map((c) => c.name);
        const itemCatNames = dbItems.map((i) => i.category).filter(Boolean);
        const popularCatNames = ['Cakes', 'Desserts', 'Burgers', 'Pizza', 'Snacks', 'Fast Food'];
        const allDbCatNames = Array.from(new Set([...popularCatNames, ...dbCatNames, ...itemCatNames]));

        setCategoriesList(['All', ...allDbCatNames]);
      } catch (err) {
        console.error('Error fetching database menu items:', err.message);
        setItems([]);
        setCategoriesList(['All', 'Cakes', 'Desserts', 'Burgers', 'Pizza', 'Snacks', 'Fast Food']);
      } finally {
        setLoading(false);
      }
    };
    fetchBackendData();
  }, []);

  const getCategoryGraphic = (categoryName) => {
    if (categoryName === 'All') {
      return { type: 'img', src: assets.cake3 };
    }
    const dbCat = dbCategories.find(
      (c) => c.name && c.name.trim().toLowerCase() === categoryName.trim().toLowerCase()
    );
    if (dbCat && dbCat.image) {
      const src = dbCat.image.startsWith('http')
        ? dbCat.image
        : `http://localhost:3000/images/${dbCat.image}`;
      return { type: 'img', src };
    }
    if (dbCat && dbCat.emoji) {
      return { type: 'emoji', emoji: dbCat.emoji };
    }
    const itemMatch = items.find(
      (i) => i.category && i.category.trim().toLowerCase() === categoryName.trim().toLowerCase()
    );
    if (itemMatch && itemMatch.image) {
      return { type: 'img', src: itemMatch.image };
    }

    const catLower = categoryName.toLowerCase();
    if (catLower.includes('burger')) return { type: 'img', src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' };
    if (catLower.includes('pizza')) return { type: 'img', src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' };
    if (catLower.includes('fries') || catLower.includes('snack')) return { type: 'img', src: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80' };

    return { type: 'img', src: assets.cake4 };
  };

  const getScaledPrices = (item) => {
    const basePrice = parseInt(String(item.price).replace(/[^0-9]/g, '')) || 699;
    const currentWeightStr = selectedWeights[item.id] || '1';

    let weightMultiplier = 1;
    if (currentWeightStr === 'custom') {
      const parsedVal = parseFloat(customWeightVal) || 6;
      weightMultiplier = parsedVal;
    } else {
      weightMultiplier = parseFloat(currentWeightStr) || 1;
    }

    const currentPrice = Math.round(basePrice * weightMultiplier);
    const originalPrice = Math.round((basePrice + 150) * weightMultiplier);

    return {
      price: `₹${currentPrice}`,
      originalPrice: `₹${originalPrice}`,
    };
  };

  const isCakeOrDessert = (item) => {
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return (
      cat.includes('cake') ||
      cat.includes('desert') ||
      cat.includes('dessert') ||
      cat.includes('pastry') ||
      cat.includes('cupcake') ||
      cat.includes('brownie') ||
      cat.includes('sweet') ||
      cat.includes('cookie') ||
      cat.includes('donut') ||
      name.includes('cake') ||
      name.includes('pastry') ||
      name.includes('dessert') ||
      name.includes('cupcake') ||
      name.includes('sweet') ||
      name.includes('truffle')
    );
  };

  const isFastFoodOrSnack = (item) => {
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return (
      cat.includes('snack') ||
      cat.includes('snake') ||
      cat.includes('burger') ||
      cat.includes('pizza') ||
      cat.includes('fast') ||
      cat.includes('fries') ||
      cat.includes('pasta') ||
      cat.includes('roll') ||
      cat.includes('sandwich') ||
      cat.includes('salad') ||
      cat.includes('veg') ||
      name.includes('burger') ||
      name.includes('pizza') ||
      name.includes('pasta') ||
      name.includes('fries') ||
      name.includes('roll') ||
      name.includes('wrap')
    );
  };

  const defaultFastFoodItems = [
    {
      id: 'ff-1',
      name: 'Gourmet Cheese Burger',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '20 MINS',
      weight: '1 Pc',
      rating: '4.8',
      discount: '20% OFF',
      originalPrice: '₹249',
      price: '₹199',
      priceValue: 199,
      category: 'Burgers',
      desc: 'Juicy grilled patty topped with melted cheddar, lettuce & special sauce.'
    },
    {
      id: 'ff-2',
      name: 'Woodfired Pepperoni Pizza',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '25 MINS',
      weight: 'Medium 8"',
      rating: '4.9',
      discount: '15% OFF',
      originalPrice: '₹399',
      price: '₹349',
      priceValue: 349,
      category: 'Pizza',
      desc: 'Crispy sourdough base with mozzarella, pepperoni & tangy tomato sauce.'
    },
    {
      id: 'ff-3',
      name: 'Crispy Peri Peri Fries',
      image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '15 MINS',
      weight: '250g',
      rating: '4.7',
      discount: 'FLAT ₹30 OFF',
      originalPrice: '₹179',
      price: '₹149',
      priceValue: 149,
      category: 'French Fries',
      desc: 'Golden crispy crinkle-cut fries tossed in fiery African peri-peri spices.'
    },
    {
      id: 'ff-4',
      name: 'Loaded Veggie Wrap',
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '20 MINS',
      weight: '300g',
      rating: '4.7',
      discount: '10% OFF',
      originalPrice: '₹219',
      price: '₹189',
      priceValue: 189,
      category: 'Fast Food',
      desc: 'Grilled tortilla stuffed with spicy cottage cheese & crunchy bell peppers.'
    }
  ];

  const allItemsCombined = [...items];
  if (allItemsCombined.filter(isFastFoodOrSnack).length < 4) {
    defaultFastFoodItems.forEach((ff) => {
      if (!allItemsCombined.some((i) => i.name === ff.name)) {
        allItemsCombined.push(ff);
      }
    });
  }

  const filteredItems = allItemsCombined.filter((item) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Cakes' || activeCategory === 'Desserts') return isCakeOrDessert(item);
    if (activeCategory === 'Snacks' || activeCategory === 'Fast Food') return isFastFoodOrSnack(item);
    if (activeCategory === 'Burgers') return item.category === 'Burgers' || item.name.toLowerCase().includes('burger');
    if (activeCategory === 'Pizza') return item.category === 'Pizza' || item.name.toLowerCase().includes('pizza');
    return item.category === activeCategory;
  });

  return (
    <div className="home-container">
      {/* Mobile App View (Screen width <= 768px) */}
      <MobileAppView
        items={items}
        categoriesList={categoriesList}
        dbCategories={dbCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Desktop & Tablet Home View (100% untouched on screens > 768px) */}
      <div className="desktop-only-home-view">
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

            <div className="category-marquee-container" aria-label="Our menu categories">
              <div className="category-track-circles">
                {(() => {
                  let marqueeItems = categoriesList;
                  if (categoriesList.length > 0) {
                    while (marqueeItems.length < 24) {
                      marqueeItems = [...marqueeItems, ...categoriesList];
                    }
                  }
                  return marqueeItems.map((category, idx) => {
                    const graphic = getCategoryGraphic(category);
                    const isActive = activeCategory === category;

                    return (
                      <button 
                        key={`${category}-${idx}`} 
                        type="button"
                        className={`category-circle-pill ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                      >
                        <div className="circle-avatar-ring">
                          {graphic.type === 'img' ? (
                            <img src={graphic.src} alt={category} />
                          ) : (
                            <span className="emoji-icon">{graphic.emoji}</span>
                          )}
                        </div>
                        <span className="circle-label">{category}</span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
            
            {/* Product Grid Showcases (Cakes & Desserts Section + Fast Food & Snacks Section) */}
            {(() => {
              const renderDesktopGrid = (itemList) => {
                if (!itemList || itemList.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
                      No items found in this section.
                    </div>
                  );
                }

                return (
                  <div className="product-grid">
                    {itemList.map((item) => {
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
                            <p className="card-item-desc">{item.desc || item.category}</p>
                            
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
                );
              };

              if (activeCategory === 'All') {
                const cakeItems = filteredItems.filter(isCakeOrDessert);
                const fastFoodItems = filteredItems.filter((i) => isFastFoodOrSnack(i) || !isCakeOrDessert(i));

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem' }}>
                    {/* Section 1: Cakes & Sweet Desserts */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.4rem' }}>
                            🎂 SWEET DELIGHTS
                          </span>
                          <h3 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                            Artisanal Cakes, Pastries & Desserts
                          </h3>
                        </div>
                        <Link to="/menu" style={{ color: '#f43f5e', fontWeight: 800, fontSize: '1.4rem', textDecoration: 'none' }}>
                          View All Cakes ➔
                        </Link>
                      </div>
                      {renderDesktopGrid(cakeItems)}
                    </div>

                    {/* Section 2: Fast Food & Savory Snacks */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.4rem' }}>
                            🍔 FAST FOOD & SAVORY
                          </span>
                          <h3 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                            Burgers, Woodfired Pizza & Snacks
                          </h3>
                        </div>
                        <Link to="/menu" style={{ color: '#ea580c', fontWeight: 800, fontSize: '1.4rem', textDecoration: 'none' }}>
                          View All Fast Food ➔
                        </Link>
                      </div>
                      {renderDesktopGrid(fastFoodItems)}
                    </div>
                  </div>
                );
              }

              return (
                <div>
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.4rem' }}>
                      ✨ SELECTED CATEGORY
                    </span>
                    <h3 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      {activeCategory} Collection
                    </h3>
                  </div>
                  {renderDesktopGrid(filteredItems)}
                </div>
              );
            })()}

            <div className="center-action" style={{ marginTop: '4rem' }}>
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
      </div>
    </div>
  );
};

export default Home;
