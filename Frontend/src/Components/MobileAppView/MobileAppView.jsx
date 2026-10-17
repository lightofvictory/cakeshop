import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MenuOutlined,
  BellOutlined,
  ShoppingOutlined,
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  PlusOutlined,
  StarFilled,
  RightOutlined,
} from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { assets } from '../../assets/assets';
import MobileSplashOnboarding from '../MobileSplashOnboarding/MobileSplashOnboarding';
import './MobileAppView.scss';

const MobileAppView = ({ items, categoriesList, dbCategories = [], activeCategory, setActiveCategory }) => {
  const { settings } = useSettings();

  const fallbackCategoryImages = {
    'all': assets.cake3,
    'cakes': assets.cake1,
    'cake item': assets.cake1,
    'pastry': assets.cake4,
    'pastries': assets.cake4,
    'desserts': assets.cake3,
    'deserts item': assets.cake3,
    'desserts item': assets.cake3,
    'cupcakes': assets.cake5,
    'snacks': assets.cake6,
    'snakes item': assets.cake2,
    'snacks item': assets.cake2,
    'salad item': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
    'pure veg': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    'party essentials': assets.cake5,
    'cookies': assets.cake7,
    'donuts': assets.cake2,
    'brownies': assets.cake1,
  };

  const getCategoryGraphic = (categoryName, idx) => {
    const cleanName = (categoryName || '').trim().toLowerCase();

    if (cleanName === 'all') {
      return { type: 'img', src: assets.cake3 };
    }

    // 1. Check DB Category image
    const dbCat = dbCategories.find(
      (c) => c.name && c.name.trim().toLowerCase() === cleanName
    );
    if (dbCat && dbCat.image) {
      const src = dbCat.image.startsWith('http')
        ? dbCat.image
        : `http://localhost:3000/images/${dbCat.image}`;
      return { type: 'img', src };
    }

    // 2. Check Item list matching image
    const itemMatch = items.find(
      (i) => i.category && i.category.trim().toLowerCase() === cleanName
    );
    if (itemMatch && itemMatch.image) {
      return { type: 'img', src: itemMatch.image };
    }

    // 3. Fallback map for specific category names
    if (fallbackCategoryImages[cleanName]) {
      return { type: 'img', src: fallbackCategoryImages[cleanName] };
    }

    // 4. Default rotating real cake photographs
    const cakeList = [assets.cake1, assets.cake2, assets.cake3, assets.cake4, assets.cake5, assets.cake6, assets.cake7];
    return { type: 'img', src: cakeList[idx % cakeList.length] };
  };
  const { itemCount, addToCart, openPreferenceModal, orderPreference } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const bannerImg = settings?.bannerImage || settings?.homeSettings?.bannerImage;
  const heroImg = bannerImg
    ? bannerImg.startsWith('http') || bannerImg.startsWith('/')
      ? bannerImg
      : `http://localhost:3000/images/${bannerImg}`
    : assets.cake3;

  const heroBanners =
    settings?.homeSettings?.heroBanners &&
    Array.isArray(settings.homeSettings.heroBanners) &&
    settings.homeSettings.heroBanners.length > 0
      ? settings.homeSettings.heroBanners
      : settings?.heroBanners && Array.isArray(settings.heroBanners) && settings.heroBanners.length > 0
      ? settings.heroBanners
      : [
          {
            title: 'BOLD FLAVORS.',
            subtitle: 'EPIC CRAVINGS. Live Bakes',
            description: 'Your sweet favorites, made fresh daily.',
            image: heroImg,
            ctaText: 'Order Now',
            ctaLink: '/menu',
          },
          {
            title: 'FRESHLY BAKED',
            subtitle: 'ARTISANAL PASTRIES',
            description: 'Handcrafted daily with love & premium cocoa.',
            image: assets.cake4,
            ctaText: 'Explore Menu',
            ctaLink: '/menu',
          },
          {
            title: 'CELEBRATE MORE',
            subtitle: 'CUSTOM PARTY CAKES',
            description: 'Make every birthday & event unforgettable.',
            image: assets.cake5,
            ctaText: 'Order Special',
            ctaLink: '/menu',
          },
        ];

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const getSlideImageUrl = (img) => {
    if (!img) return heroImg;
    if (typeof img !== 'string') return img;
    if (
      img.startsWith('http') ||
      img.startsWith('blob:') ||
      img.startsWith('data:') ||
      img.startsWith('/')
    ) {
      return img;
    }
    return `http://localhost:3000/images/${img}`;
  };

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 40 && heroBanners.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }
    if (distance < -40 && heroBanners.length > 0) {
      setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1));
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const activeSlide = heroBanners[currentSlide] || heroBanners[0];
  const activeSlideImage = getSlideImageUrl(activeSlide?.image);

  // Sub Promo Banner Carousel for Best Sales (5 Auto-Scrolling Cards)
  const bestSalesPromos = [
    {
      id: 1,
      tag: '🔥 BEST SELLER',
      title: 'Choco Berry Supreme',
      offer: 'FLAT 20% OFF',
      desc: 'Rich dark Belgian chocolate layered with fresh strawberries.',
      badge: '20% OFF',
      image: assets.cake4,
      bgGradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      btnColor: '#f43f5e',
      link: '/menu',
    },
    {
      id: 2,
      tag: '⭐ TOP RATED',
      title: 'Artisanal Mango Mousse',
      offer: 'BUY 1 GET 1 50% OFF',
      desc: 'Alphonso mango pulp with light velvet whipped cream.',
      badge: 'BOGO',
      image: assets.cake3,
      bgGradient: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
      btnColor: '#eab308',
      link: '/menu',
    },
    {
      id: 3,
      tag: '🎉 PARTY FAVORITE',
      title: 'Celebration Combo Box',
      offer: 'SAVE ₹150 TODAY',
      desc: 'Assorted 6 mini pastries & gourmet cupcakes combo.',
      badge: 'SAVE ₹150',
      image: assets.cake5,
      bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
      btnColor: '#16a34a',
      link: '/menu',
    },
    {
      id: 4,
      tag: '👑 CHEF’S SPECIAL',
      title: 'Pistachio Cream Delight',
      offer: 'EXTRA 15% OFF',
      desc: 'Roasted Iranian pistachios with white chocolate ganache.',
      badge: '15% OFF',
      image: assets.cake6,
      bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)',
      btnColor: '#9333ea',
      link: '/menu',
    },
    {
      id: 5,
      tag: '✨ TODAY’S SPECIAL',
      title: 'Caramel Butterscotch',
      offer: 'FLAT ₹99 CASHBACK',
      desc: 'Golden caramel crunch layered with praline butter cream.',
      badge: 'CASHBACK',
      image: assets.cake2,
      bgGradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      btnColor: '#ea580c',
      link: '/menu',
    },
  ];

  const [bestSalesIndex, setBestSalesIndex] = useState(0);
  const [bestSalesTouchStart, setBestSalesTouchStart] = useState(0);
  const [bestSalesTouchEnd, setBestSalesTouchEnd] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBestSalesIndex((prev) => (prev + 1) % bestSalesPromos.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [bestSalesPromos.length]);

  const handleBestSalesTouchStart = (e) => setBestSalesTouchStart(e.targetTouches[0].clientX);
  const handleBestSalesTouchMove = (e) => setBestSalesTouchEnd(e.targetTouches[0].clientX);
  const handleBestSalesTouchEnd = () => {
    if (!bestSalesTouchStart || !bestSalesTouchEnd) return;
    const dist = bestSalesTouchStart - bestSalesTouchEnd;
    if (dist > 40) {
      setBestSalesIndex((prev) => (prev + 1) % bestSalesPromos.length);
    }
    if (dist < -40) {
      setBestSalesIndex((prev) => (prev === 0 ? bestSalesPromos.length - 1 : prev - 1));
    }
    setBestSalesTouchStart(0);
    setBestSalesTouchEnd(0);
  };

  const activeBestSale = bestSalesPromos[bestSalesIndex] || bestSalesPromos[0];

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

  const filteredDisplayItems = allItemsCombined.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      activeCategory === 'All' ||
      item.category === activeCategory ||
      (activeCategory === 'Cakes' && isCakeOrDessert(item)) ||
      (activeCategory === 'Desserts' && isCakeOrDessert(item)) ||
      (activeCategory === 'Snacks' && isFastFoodOrSnack(item)) ||
      (activeCategory === 'Burgers' && (item.category === 'Burgers' || item.name.toLowerCase().includes('burger'))) ||
      (activeCategory === 'Pizza' && (item.category === 'Pizza' || item.name.toLowerCase().includes('pizza')));
    return matchesSearch && matchesCat;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const renderCardsGrid = (itemList) => {
    if (!itemList || itemList.length === 0) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
          No items found in this section.
        </div>
      );
    }
    return (
      <div className="popular-cards-grid">
        {itemList.map((item) => {
          const isFav = favorites[item.id];
          const badgeText = item.discount || item.badge;
          return (
            <div className="mobile-product-card" key={item.id}>
              {badgeText && <span className="card-badge">{badgeText}</span>}
              <button
                className="wishlist-btn"
                onClick={() => toggleFavorite(item.id)}
                title="Save item"
              >
                {isFav ? (
                  <HeartFilled style={{ color: '#f43f5e' }} />
                ) : (
                  <HeartOutlined style={{ color: '#64748b' }} />
                )}
              </button>

              <div className="card-img-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = assets.cake3;
                  }}
                />
              </div>

              <div className="card-info-wrap">
                <h4 className="card-title">{item.name}</h4>
                <p className="card-sub">{item.desc || item.category || 'Fresh artisan baked cake'}</p>

                <div className="card-rating-row">
                  <StarFilled style={{ color: '#eab308', fontSize: '12px' }} />
                  <span className="rating-num">{item.rating || '4.8'}</span>
                </div>

                <div className="card-bottom-row">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {item.originalPrice && item.originalPrice !== item.price && (
                      <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#94a3b8', fontWeight: 600 }}>
                        {item.originalPrice}
                      </span>
                    )}
                    <span className="card-price" style={{ color: '#e03c78', fontWeight: 900 }}>{item.price}</span>
                  </div>
                  <button
                    className="add-btn"
                    onClick={() => addToCart({ id: item.id, name: item.name, price: item.priceValue || 549, image: item.image })}
                    title="Add to cart"
                  >
                    <PlusOutlined style={{ color: '#ffffff', fontSize: '14px' }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mobile-app-wrapper">
      {/* Step 1: Starting Card Onboarding Splash Screen */}
      {showSplash && (
        <MobileSplashOnboarding
          onComplete={() => {
            setShowSplash(false);
            openPreferenceModal();
          }}
        />
      )}

      {/* 1. Top Mobile Header Bar (Scrolls with page) */}
      <div className="mobile-header-bar">
        <div className="left-group">
          <button className="menu-btn logo-mode" aria-label="Open navigation menu" onClick={() => setIsDrawerOpen(true)}>
            <img
              src={
                settings?.logo || settings?.shopLogo || settings?.homeSettings?.logo
                  ? (settings.logo || settings.shopLogo || settings.homeSettings.logo).startsWith('http')
                    ? (settings.logo || settings.shopLogo || settings.homeSettings.logo)
                    : `http://localhost:3000/images/${settings.logo || settings.shopLogo || settings.homeSettings.logo}`
                  : assets.cakelogo || assets.pastry
              }
              alt={settings?.shopName || 'Shop Logo'}
              className="header-shop-logo"
            />
          </button>
          <div className="brand-greeting">
            <span className="greeting-text">Hey, Cake Lover! 👋</span>
            <h1 className="brand-title">{settings?.shopName || 'MR. PASTRY'}</h1>
            <p className="brand-tagline">Fresh Bakes. Crave More.</p>
          </div>
        </div>

        <div className="right-actions">
          <button className="icon-circle-btn" title="Notifications">
            <BellOutlined style={{ fontSize: '18px' }} />
            <span className="badge-count">3</span>
          </button>
          <Link to="/cart" className="icon-circle-btn" title="Cart">
            <ShoppingOutlined style={{ fontSize: '18px' }} />
            {itemCount > 0 && <span className="badge-count cart">{itemCount}</span>}
          </Link>
        </div>
      </div>

      {/* 2. Search Input Box & Active Order Type Indicator */}
      <div className="mobile-search-row">
        <div className="search-pill">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Search your favorite cakes, burgers & pizza..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Step 2 & 3: Selected Order Type Indicator Bar (Click to Change) */}
      <div className="mobile-order-type-bar" onClick={openPreferenceModal}>
        <div className="order-type-pill">
          <span className="type-icon">
            {orderPreference?.mode === 'dinein' ? '🍽️' : orderPreference?.mode === 'pickup' ? '🛍️' : '🚚'}
          </span>
          <span className="type-label">
            {orderPreference?.mode === 'dinein'
              ? `Dine In • ${orderPreference?.tableNumber ? (orderPreference.tableNumber.toLowerCase().includes('table') ? orderPreference.tableNumber : `Table #${orderPreference.tableNumber}`) : 'Table #1'} (${orderPreference?.guestCount ? `${orderPreference.guestCount} Guests` : '2 Guests'})`
              : orderPreference?.mode === 'pickup'
              ? `Pickup • ${orderPreference?.pickupBranch || 'Main Store'}`
              : `Delivery • ${orderPreference?.formattedTime || 'ASAP (25 mins)'}`}
          </span>
          <span className="change-btn">Change ➔</span>
        </div>
      </div>

      {/* Mobile Menu Side Drawer */}
      {isDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99999,
            display: 'flex',
          }}
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            style={{
              width: '280px',
              backgroundColor: '#ffffff',
              height: '100%',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontWeight: 900, fontSize: '18px', color: '#0f172a' }}>{settings?.shopName || 'Mr. Pastry'}</span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                backgroundColor: '#f43f5e',
                color: '#ffffff',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '14px',
                textDecoration: 'none',
                marginBottom: '20px',
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)',
              }}
            >
              👑 Open Admin Portal
            </a>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px', fontWeight: 700 }}>
              <button
                onClick={() => {
                  setShowSplash(true);
                  setIsDrawerOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f43f5e',
                  fontWeight: 800,
                  fontSize: '15px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ✨ Starting Welcome Page
              </button>
              <Link to="/" onClick={() => setIsDrawerOpen(false)} style={{ color: '#1e293b', textDecoration: 'none' }}>
                🏠 Home
              </Link>
              <Link to="/menu" onClick={() => setIsDrawerOpen(false)} style={{ color: '#1e293b', textDecoration: 'none' }}>
                🎂 Categories
              </Link>
              <Link to="/signin" onClick={() => setIsDrawerOpen(false)} style={{ color: '#1e293b', textDecoration: 'none' }}>
                👤 Account
              </Link>
              <Link to="/cart" onClick={() => setIsDrawerOpen(false)} style={{ color: '#1e293b', textDecoration: 'none' }}>
                🛒 Cart
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Hero Gradient Banner Carousel (Dynamic Admin Data) */}
      <div
        className="mobile-hero-banner"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="banner-text-side animate-banner-in" key={`mobile-text-${currentSlide}`}>
          <span className="banner-eyebrow">{activeSlide.title || 'BOLD FLAVORS.'}</span>
          <h2 className="banner-heading">
            {activeSlide.subtitle ? (
              activeSlide.subtitle.includes('.') ? (
                <>
                  {activeSlide.subtitle.split('.')[0]}.<br />
                  <span className="gold-text">{activeSlide.subtitle.split('.').slice(1).join('.')}</span>
                </>
              ) : (
                activeSlide.subtitle
              )
            ) : (
              <>
                EPIC CRAVINGS.<br />
                <span className="gold-text">Live Bakes</span>
              </>
            )}
          </h2>
          <p className="banner-subtext">{activeSlide.description || 'Your sweet favorites, made fresh daily.'}</p>
          <Link to={activeSlide.ctaLink || '/menu'} className="banner-cta-btn">
            {activeSlide.ctaText || 'Order Now'} <RightOutlined style={{ fontSize: '12px' }} />
          </Link>
        </div>

        <div className="banner-image-side animate-banner-in" key={`mobile-img-${currentSlide}`}>
          <img src={activeSlideImage} alt={activeSlide.title || 'Hero Banner'} />
        </div>

        {/* Dynamic Slide Dots Navigation */}
        <div className="banner-dots">
          {heroBanners.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              style={{ cursor: 'pointer' }}
            ></span>
          ))}
        </div>
      </div>

      {/* 4. Horizontal Category Circles (Bubble Bar) */}
      <div className="mobile-categories-section">
        <div className="bubble-scroll-row">
          {(() => {
            let mobileItems = categoriesList;
            if (categoriesList.length > 0) {
              while (mobileItems.length < 20) {
                mobileItems = [...mobileItems, ...categoriesList];
              }
            }
            return mobileItems.map((cat, idx) => {
              const graphic = getCategoryGraphic(cat, idx);

              return (
                <button
                  key={`${cat}-${idx}`}
                  className={`category-bubble-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <div className="bubble-avatar">
                    <img src={graphic.src} alt={cat} />
                  </div>
                  <span className="bubble-label">{cat}</span>
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* 5. Product Showcases (Cakes & Desserts Section + Fast Food & Snacks Section) */}
      {activeCategory === 'All' && !searchTerm.trim() ? (
        <>
          {/* Section 1: Cakes & Sweet Desserts */}
          <div className="mobile-popular-section cakes-section">
            <div className="section-head-row">
              <div className="section-title-wrap">
                <span className="section-badge-tag">🎂 SWEET DESSERTS</span>
                <h3 className="section-title">Artisanal Cakes & Pastries</h3>
              </div>
              <Link to="/menu" className="view-all-link">
                View All <RightOutlined style={{ fontSize: '11px' }} />
              </Link>
            </div>
            {renderCardsGrid(filteredDisplayItems.filter(isCakeOrDessert))}
          </div>

          {/* Section 2: Fast Food & Savory Snacks */}
          <div className="mobile-popular-section fast-food-section">
            <div className="section-head-row">
              <div className="section-title-wrap">
                <span className="section-badge-tag fast-food">🍔 FAST FOOD & SAVORY</span>
                <h3 className="section-title">Burgers, Pizza & Snacks</h3>
              </div>
              <Link to="/menu" className="view-all-link">
                View All <RightOutlined style={{ fontSize: '11px' }} />
              </Link>
            </div>
            {renderCardsGrid(
              filteredDisplayItems.filter((i) => isFastFoodOrSnack(i) || !isCakeOrDessert(i))
            )}
          </div>
        </>
      ) : (
        /* Filtered Search / Category Selection Section */
        <div className="mobile-popular-section">
          <div className="section-head-row">
            <div className="section-title-wrap">
              <span className="section-badge-tag">✨ SELECTION</span>
              <h3 className="section-title">
                {searchTerm ? `Search Results for "${searchTerm}"` : `${activeCategory} Collection`}
              </h3>
            </div>
            <Link to="/menu" className="view-all-link">
              View All <RightOutlined style={{ fontSize: '11px' }} />
            </Link>
          </div>
          {renderCardsGrid(filteredDisplayItems)}
        </div>
      )}

      {/* 6. Sub Promo Banner for Best Sales (5-Card Auto-Scrolling Carousel) */}
      <div className="mobile-subpromo-best-sales-section">
        <div className="subpromo-head-row">
          <span className="subpromo-badge-tag">BEST SALES & DEALS</span>
          <h3 className="subpromo-main-heading">Best Sellers Special Offers ✨</h3>
        </div>

        <div
          className="subpromo-carousel-card"
          onTouchStart={handleBestSalesTouchStart}
          onTouchMove={handleBestSalesTouchMove}
          onTouchEnd={handleBestSalesTouchEnd}
          style={{ background: activeBestSale.bgGradient }}
        >
          <div className="subpromo-text-col animate-subpromo-fade" key={`sales-text-${bestSalesIndex}`}>
            <span className="subpromo-card-tag">{activeBestSale.tag}</span>
            <h4 className="subpromo-card-title">{activeBestSale.title}</h4>
            <span className="subpromo-offer-pill">{activeBestSale.offer}</span>
            <p className="subpromo-card-desc">{activeBestSale.desc}</p>
            <Link to={activeBestSale.link} className="subpromo-action-btn" style={{ background: activeBestSale.btnColor }}>
              Claim Deal <RightOutlined style={{ fontSize: '10px' }} />
            </Link>
          </div>

          <div className="subpromo-img-col animate-subpromo-fade" key={`sales-img-${bestSalesIndex}`}>
            <div className="corner-sale-badge" style={{ background: activeBestSale.btnColor }}>
              <span>{activeBestSale.badge}</span>
            </div>
            <img src={activeBestSale.image} alt={activeBestSale.title} />
          </div>

          {/* 5 Carousel Dot Indicators */}
          <div className="subpromo-carousel-dots">
            {bestSalesPromos.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${bestSalesIndex === idx ? 'active' : ''}`}
                onClick={() => setBestSalesIndex(idx)}
                style={{ cursor: 'pointer' }}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppView;
