import { cakeImages } from '../../assets/cakeimages/Menus_Image.js';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Button, Input, Modal, Rate, notification, DatePicker, Select } from 'antd';
import { 
  customizedCakesCategories, 
  dessertsBakery, 
  snacksFastFood, 
  beverages, 
  partyEssentials 
} from '../../assets/menuData';
import { 
  FilterOutlined, 
  SearchOutlined, 
  CloseOutlined, 
  ReloadOutlined, 
  StarFilled,
  UploadOutlined,
  HeartFilled,
  FireFilled,
  CheckCircleFilled,
  RocketFilled,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import "./Menu.scss";

const categoryLabels = {
  NUTS_LOVERS: "Nuts Lovers",
  CHOCOLATE_LOVERS: "Chocolate Lovers",
  FRUIT_LOVERS: "Fruit & Berry Cakes",
  PREMIUM_CAKES: "Premium Cakes"
};

const Menu = () => {
    const { addToCart, cartItems, updateQuantity } = useCart();
    const [ratings, setRatings] = useState(() => JSON.parse(localStorage.getItem('mr-pastry-ratings') || '{}'));
    const [reviews, setReviews] = useState(() => JSON.parse(localStorage.getItem('mr-pastry-reviews') || '{}'));
    const [selectedCake, setSelectedCake] = useState(null);
    const [selectedWeights, setSelectedWeights] = useState({});
    const [selectedVariants, setSelectedVariants] = useState({});
    const [cakeMessage, setCakeMessage] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    
    // Custom Weight Modal State
    const [customModalItem, setCustomModalItem] = useState(null);
    const [customWeightVal, setCustomWeightVal] = useState('6');
    
    // Review States
    const [reviewText, setReviewText] = useState('');
    const [commentRating, setCommentRating] = useState(5);

    // Main Category Nav Tab State
    const [activeTab, setActiveTab] = useState('ALL');

    // Sidebar & Top Bar Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
    const [selectedPriceFilter, setSelectedPriceFilter] = useState('ALL');
    const [selectedRatingFilter, setSelectedRatingFilter] = useState('ALL');
    const [dietFilter, setDietFilter] = useState('ALL'); // ALL, VEG, EGGLESS
    const [sortBy, setSortBy] = useState('DEFAULT');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Custom Cake Request Form Modal State
    const [isCustomRequestModalOpen, setIsCustomRequestModalOpen] = useState(false);
    const [customFormData, setCustomFormData] = useState({
        customerName: '',
        mobileNumber: '',
        eventDate: '',
        servingsWeight: '1 kg (6-8 People)',
        preferredFlavour: 'Chocolate Truffle',
        description: '',
        budgetRange: '₹1,000 - ₹2,000',
        referenceImage: null,
        imagePreview: ''
    });

    useEffect(() => {
        localStorage.setItem('mr-pastry-ratings', JSON.stringify(ratings));
    }, [ratings]);

    useEffect(() => {
        localStorage.setItem('mr-pastry-reviews', JSON.stringify(reviews));
    }, [reviews]);

    // Gourmet Toast Notification Helper
    const showToast = (type, title, description) => {
        notification[type]({
            message: title,
            description: description,
            placement: 'topRight',
            duration: 3,
            className: 'gourmet-toast-notification',
            icon: type === 'success' ? <CheckCircleOutlined style={{ color: '#e03c78' }} /> : undefined
        });
    };

    const openCakeModal = (item) => {
        setSelectedCake(item);
        setReviewText('');
        setCommentRating(5);
        setCakeMessage('');
    };

    const saveReview = () => {
        if (!reviewText.trim() || !selectedCake) return;
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeString = `Today at ${formattedTime}`;

        const newObj = {
            id: Date.now(),
            userName: "You",
            userAvatar: "YOU",
            rating: commentRating || 5,
            comment: reviewText.trim(),
            date: timeString,
            likes: 0,
            isLiked: false
        };
        const existing = reviews[selectedCake.id] || [];
        setReviews({
            ...reviews,
            [selectedCake.id]: [newObj, ...existing]
        });
        setReviewText('');
        setCommentRating(5);
        showToast('success', 'Review Posted! ✨', 'Thank you for sharing your experience with our bakery!');
    };

    const toggleLikeReview = (cakeId, reviewId) => {
        setReviews(prev => {
            const list = prev[cakeId] || [];
            const updated = list.map((item, idx) => {
                const targetId = typeof item === 'object' ? item.id : `legacy-${idx}`;
                if (targetId === reviewId) {
                    const normalized = typeof item === 'object' ? item : {
                        id: `legacy-${idx}`,
                        userName: "Customer",
                        userAvatar: "CU",
                        rating: 5,
                        comment: item,
                        date: "Recently",
                        likes: 4,
                        isLiked: false
                    };
                    const isLiked = !normalized.isLiked;
                    const likes = isLiked ? (normalized.likes || 0) + 1 : Math.max(0, (normalized.likes || 1) - 1);
                    return { ...normalized, isLiked, likes };
                }
                return item;
            });
            return { ...prev, [cakeId]: updated };
        });
    };

    // Calculate scaled price based on weight/size for cakes
    const getScaledPrices = (itemId, basePriceStr) => {
        const basePrice = parseInt(basePriceStr?.replace(/[^0-9]/g, '') || '499') || 499;
        const baseOrig = Math.round(basePrice * 1.25);
        const weightKey = selectedWeights[itemId] || '1';

        if (weightKey === 'custom') {
            const customKg = parseFloat(customWeightVal) || 6;
            const mult = customKg * 0.85;
            return {
                baseNum: Math.round(basePrice * mult),
                price: `₹${Math.round(basePrice * mult).toLocaleString('en-IN')}`,
                originalPrice: `₹${Math.round(baseOrig * mult).toLocaleString('en-IN')}`,
                weightText: `${customKg} Kg (Custom)`,
                servesText: `${Math.round(customKg * 6)}–${Math.round(customKg * 8)} people`
            };
        }

        const kg = parseFloat(weightKey);
        const mult = kg === 1 ? 1 : kg === 2 ? 1.85 : kg === 3 ? 2.7 : kg === 4 ? 3.5 : 4.3;
        const minServes = Math.round(kg * 6);
        const maxServes = Math.round(kg * 8);

        return {
            baseNum: Math.round(basePrice * mult),
            price: `₹${Math.round(basePrice * mult).toLocaleString('en-IN')}`,
            originalPrice: `₹${Math.round(baseOrig * mult).toLocaleString('en-IN')}`,
            weightText: `${kg} Kg`,
            servesText: `${minServes}–${maxServes} people`
        };
    };

    // Image upload handler for custom cake request form
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomFormData(prev => ({
                    ...prev,
                    referenceImage: file,
                    imagePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Custom Cake Request Form Submit
    const handleCustomRequestSubmit = (e) => {
        e.preventDefault();
        if (!customFormData.customerName || !customFormData.mobileNumber) {
            showToast('error', 'Incomplete Form ⚠️', 'Please enter your name and mobile number.');
            return;
        }
        showToast('success', 'Custom Cake Request Sent! 🎉', 'Thank you! Our master baker will call you shortly to confirm your cake design.');
        setIsCustomRequestModalOpen(false);
        setCustomFormData({
            customerName: '',
            mobileNumber: '',
            eventDate: '',
            servingsWeight: '1 kg (6-8 People)',
            preferredFlavour: 'Chocolate Truffle',
            description: '',
            budgetRange: '₹1,000 - ₹2,000',
            referenceImage: null,
            imagePreview: ''
        });
    };

    // Filtered Cake Items calculation
    const filteredCakeGroupedItems = useMemo(() => {
        const result = {};
        const targetCategories = selectedCategoryFilter === 'ALL' 
            ? Object.keys(cakeImages) 
            : [selectedCategoryFilter];

        targetCategories.forEach(cat => {
            if (!cakeImages[cat]) return;
            
            let items = cakeImages[cat].map(item => {
                const itemId = `${cat}-${item.name}`;
                const numPrice = parseInt(item.price?.replace(/[^0-9]/g, '') || '499');
                return {
                    ...item,
                    id: itemId,
                    categoryKey: cat,
                    ratingVal: 4.8,
                    numericPrice: numPrice,
                    isEggless: true,
                    isVeg: true,
                    type: 'cake'
                };
            });

            // 1. Search Query Filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                items = items.filter(i => i.name.toLowerCase().includes(q));
            }

            // 2. Price Range Filter
            if (selectedPriceFilter === 'UNDER_750') {
                items = items.filter(i => i.numericPrice < 750);
            } else if (selectedPriceFilter === '750_1000') {
                items = items.filter(i => i.numericPrice >= 750 && i.numericPrice <= 1000);
            } else if (selectedPriceFilter === 'ABOVE_1000') {
                items = items.filter(i => i.numericPrice > 1000);
            }

            // 3. Rating Filter
            if (selectedRatingFilter === '4.8') {
                items = items.filter(i => i.ratingVal >= 4.8);
            } else if (selectedRatingFilter === '4.5') {
                items = items.filter(i => i.ratingVal >= 4.5);
            }

            // 4. Diet Filter
            if (dietFilter === 'EGGLESS') {
                items = items.filter(i => i.isEggless);
            } else if (dietFilter === 'VEG') {
                items = items.filter(i => i.isVeg);
            }

            // 5. Sorting
            if (sortBy === 'PRICE_LOW_HIGH') {
                items.sort((a, b) => a.numericPrice - b.numericPrice);
            } else if (sortBy === 'PRICE_HIGH_LOW') {
                items.sort((a, b) => b.numericPrice - a.numericPrice);
            }

            if (items.length > 0) {
                result[cat] = items;
            }
        });

        return result;
    }, [searchQuery, selectedCategoryFilter, selectedPriceFilter, selectedRatingFilter, dietFilter, sortBy]);

    // Generic list filter helper
    const filterListItems = (list, itemType) => {
        let items = list.map(i => ({ ...i, type: itemType }));
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            items = items.filter(i => i.name.toLowerCase().includes(q) || (i.category && i.category.toLowerCase().includes(q)));
        }
        if (dietFilter === 'EGGLESS') {
            items = items.filter(i => i.isEggless);
        } else if (dietFilter === 'VEG') {
            items = items.filter(i => i.isVeg);
        }
        if (sortBy === 'PRICE_LOW_HIGH') {
            items.sort((a, b) => parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, '')));
        } else if (sortBy === 'PRICE_HIGH_LOW') {
            items.sort((a, b) => parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, '')));
        }
        return items;
    };

    const filteredCustomCakes = filterListItems(customizedCakesCategories, 'custom_cake');
    const filteredDesserts = filterListItems(dessertsBakery, 'dessert');
    const filteredSnacks = filterListItems(snacksFastFood, 'snack');
    const filteredBeverages = filterListItems(beverages, 'beverage');
    const filteredParty = filterListItems(partyEssentials, 'party');

    const totalCakesCount = Object.values(filteredCakeGroupedItems).reduce((acc, curr) => acc + curr.length, 0);
    const totalFilteredCount = totalCakesCount + filteredCustomCakes.length + filteredDesserts.length + filteredSnacks.length + filteredBeverages.length + filteredParty.length;

    const hasActiveFilters = searchQuery || selectedCategoryFilter !== 'ALL' || selectedPriceFilter !== 'ALL' || selectedRatingFilter !== 'ALL' || dietFilter !== 'ALL' || sortBy !== 'DEFAULT';

    const resetAllFilters = () => {
        setSearchQuery('');
        setSelectedCategoryFilter('ALL');
        setSelectedPriceFilter('ALL');
        setSelectedRatingFilter('ALL');
        setDietFilter('ALL');
        setSortBy('DEFAULT');
        setActiveTab('ALL');
        showToast('info', 'Filters Cleared 🔄', 'Showing all menu items.');
    };

    const renderSidebarFilterContent = () => (
        <aside className="menu-filter-sidebar">
            <div className="sidebar-header">
                <h3><FilterOutlined /> Filter Menu</h3>
                {hasActiveFilters && (
                    <button type="button" className="reset-filter-btn" onClick={resetAllFilters}>
                        <ReloadOutlined /> Reset
                    </button>
                )}
            </div>

            {/* Search Input Box */}
            <div className="filter-group search-filter-group">
                <label>Search All Items</label>
                <div className="search-input-box">
                    <SearchOutlined className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search cakes, snacks, coffee..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
                <label>Menu Section</label>
                <div className="filter-options-list">
                    {[
                        { key: 'ALL', label: 'All Menu' },
                        { key: 'CAKES', label: '🎂 Cakes' },
                        { key: 'CUSTOM', label: '🎨 Customized Cakes' },
                        { key: 'DESSERTS', label: '🧁 Desserts & Bakery' },
                        { key: 'SNACKS', label: '🍔 Snacks & Fast Food' },
                        { key: 'BEVERAGES', label: '☕ Tea & Beverages' },
                        { key: 'PARTY', label: '🎉 Party Essentials' }
                    ].map(t => (
                        <button 
                            key={t.key}
                            type="button"
                            className={`filter-chip ${activeTab === t.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Diet Filter */}
            <div className="filter-group">
                <label>Diet & Preference</label>
                <div className="filter-options-list">
                    {[
                        { key: 'ALL', label: 'All Items' },
                        { key: 'VEG', label: '🟢 100% Pure Veg' },
                        { key: 'EGGLESS', label: '🌿 100% Eggless' }
                    ].map(d => (
                        <button 
                            key={d.key}
                            type="button"
                            className={`filter-chip ${dietFilter === d.key ? 'active' : ''}`}
                            onClick={() => setDietFilter(d.key)}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
                <label>Price Range</label>
                <div className="filter-options-list">
                    {[
                        { key: 'ALL', label: 'All Prices' },
                        { key: 'UNDER_750', label: 'Under ₹750' },
                        { key: '750_1000', label: '₹750 – ₹1,000' },
                        { key: 'ABOVE_1000', label: 'Above ₹1,000' }
                    ].map(p => (
                        <button 
                            key={p.key}
                            type="button"
                            className={`filter-chip ${selectedPriceFilter === p.key ? 'active' : ''}`}
                            onClick={() => setSelectedPriceFilter(p.key)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sort Options */}
            <div className="filter-group">
                <label>Sort By</label>
                <select 
                    className="filter-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="DEFAULT">Featured / Recommended</option>
                    <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                    <option value="PRICE_HIGH_LOW">Price: High to Low</option>
                </select>
            </div>
        </aside>
    );

    return (
        <main className="menu-page-container">
            <div className="menu-decor-circle-1"></div>
            <div className="menu-decor-circle-2"></div>

            <div className="menu-page-content">
                
                {/* Section Header */}
                <div className="menu-section-header">
                    <span className="menu-badge">Gourmet Bakery & Café</span>
                    <h2 className="menu-title">Our Delicious <span>Menu</span></h2>
                    <p className="menu-subtitle">Explore freshly baked cakes, snacks, beverages, and party supplies for your sweet celebrations.</p>
                </div>

                {/* Sticky Top Category Navigation Bar */}
                <nav className="sticky-menu-nav-bar">
                    <div className="nav-tabs-scroll-wrapper">
                        {[
                            { key: 'ALL', label: 'All Menu' },
                            { key: 'CAKES', label: '🎂 Cakes' },
                            { key: 'CUSTOM', label: '🎨 Customized Cakes' },
                            { key: 'DESSERTS', label: '🧁 Desserts & Bakery' },
                            { key: 'SNACKS', label: '🍔 Snacks & Fast Food' },
                            { key: 'BEVERAGES', label: '☕ Beverages' },
                            { key: 'PARTY', label: '🎉 Party Essentials' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`sticky-nav-tab ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Mobile Filter Toggle Button */}
                <div className="mobile-filter-bar-row">
                    <button 
                        type="button" 
                        className="mobile-filter-toggle-btn"
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        <FilterOutlined /> Filter & Sort Menu
                        {hasActiveFilters && <span className="active-dot">•</span>}
                    </button>
                    <span className="results-count-text">{totalFilteredCount} Items found</span>
                </div>

                {/* Main 2-Column Layout */}
                <div className="menu-catalog-layout">
                    
                    {/* Left Sticky Filter Sidebar (Desktop) */}
                    <div className="desktop-sidebar-wrapper">
                        {renderSidebarFilterContent()}
                    </div>

                    {/* Right Product Grid Column */}
                    <div className="menu-main-products-column">
                        
                        {/* Results Summary Bar */}
                        <div className="results-summary-bar">
                            <span>Showing <strong>{totalFilteredCount}</strong> items in <strong>{activeTab === 'ALL' ? 'All Categories' : activeTab}</strong></span>
                            {hasActiveFilters && (
                                <button type="button" className="clear-all-pill" onClick={resetAllFilters}>
                                    Clear Filters ✕
                                </button>
                            )}
                        </div>

                        {totalFilteredCount === 0 ? (
                            <div className="no-filtered-results">
                                <span className="no-res-icon">🎂</span>
                                <h3>No products match your filters</h3>
                                <p>Try clearing your search query or adjusting your price/diet filters.</p>
                                <button type="button" className="reset-btn" onClick={resetAllFilters}>Reset All Filters</button>
                            </div>
                        ) : (
                            <div className="menu-categories-wrapper">
                                
                                {/* 1. CAKES SECTION */}
                                {(activeTab === 'ALL' || activeTab === 'CAKES') && totalCakesCount > 0 && (
                                    <section className="menu-category-section" id="cakes-section">
                                        <div className="section-title-wrapper">
                                            <h3 className="category-title">🎂 Fresh Gourmet Cakes</h3>
                                            <span className="category-subtitle">Baked fresh to order with 100% premium ingredients</span>
                                        </div>

                                        {Object.keys(filteredCakeGroupedItems).map((category) => (
                                            <div key={category} className="subcategory-block">
                                                <h4 className="subcategory-title">~ {categoryLabels[category] || category} ~</h4>
                                                <div className="cakes-grid">
                                                    {filteredCakeGroupedItems[category].map((item) => {
                                                        const itemId = item.id;
                                                        const scaled = getScaledPrices(itemId, item.price);
                                                        const currentWeight = selectedWeights[itemId] || '1';

                                                        return (
                                                            <article key={itemId} className="sample-cake-card menu-cake-card" onClick={() => openCakeModal({ ...item, id: itemId })}>
                                                                <div className="card-image-box">
                                                                    <img src={item.image} alt={item.name} />
                                                                    <span className="diet-pill veg">🌿 Eggless</span>
                                                                    <span className="rating-pill">4.8 ★</span>
                                                                    <button type="button" className="quick-add-btn" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, id: itemId, price: scaled.price, weight: scaled.weightText }); showToast('success', 'Added to Cart! 🛒', `${item.name} (${scaled.weightText}) has been added.`); }} aria-label={`Add ${item.name} to cart`}>+</button>
                                                                </div>
                                                                <div className="card-content-box">
                                                                    <h3 className="card-item-name">{item.name}</h3>
                                                                    <p className="card-item-desc">Rich layers, balanced sweetness, and a soft cream finish.</p>
                                                                    
                                                                    <div className="custom-weight-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
                                                                        <button 
                                                                            type="button" 
                                                                            className="weight-dropdown-pill"
                                                                            onClick={() => setOpenDropdownId(openDropdownId === itemId ? null : itemId)}
                                                                        >
                                                                            <span className="weight-text">
                                                                                {currentWeight === 'custom' ? `${customWeightVal || 6} Kg` : `${currentWeight} Kg`}
                                                                            </span>
                                                                            <span className="pink-arrow">▾</span>
                                                                        </button>

                                                                        {openDropdownId === itemId && (
                                                                            <>
                                                                                <div className="weight-dropdown-overlay" onClick={() => setOpenDropdownId(null)} />
                                                                                <ul className="weight-dropdown-menu">
                                                                                    {['1', '2', '3', '4', '5'].map((kg) => (
                                                                                        <li 
                                                                                            key={kg}
                                                                                            className={currentWeight === kg ? 'active' : ''}
                                                                                            onClick={() => {
                                                                                                setSelectedWeights(prev => ({ ...prev, [itemId]: kg }));
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
                                                                                            setSelectedWeights(prev => ({ ...prev, [itemId]: 'custom' }));
                                                                                            setOpenDropdownId(null);
                                                                                        }}
                                                                                    >
                                                                                        <span>Custom Weight (6+ Kg)...</span>
                                                                                    </li>
                                                                                </ul>
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    <div className="card-bottom-row">
                                                                        <div className="price-stack">
                                                                            <span className="current-price">{scaled.price}</span>
                                                                            <span className="original-price">{scaled.originalPrice}</span>
                                                                        </div>
                                                                        <button type="button" className="add-cart-btn-sm" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, id: itemId, price: scaled.price, weight: scaled.weightText }); showToast('success', 'Added to Cart! 🛒', `${item.name} (${scaled.weightText}) has been added.`); }}>
                                                                            Add +
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </section>
                                )}

                                {/* 2. CUSTOMIZED CAKES SECTION + CTA BANNER */}
                                {(activeTab === 'ALL' || activeTab === 'CUSTOM') && (
                                    <section className="menu-category-section" id="custom-cakes-section">
                                        
                                        {/* Custom Cake Banner CTA */}
                                        <div className="custom-cake-hero-banner">
                                            <div className="banner-text">
                                                <span className="sparkle-badge">✨ Made to Order</span>
                                                <h3>Have a dream cake in mind? Let's make it happen! 🎂✨</h3>
                                                <p>Upload your reference design, choose your flavours, weight, and date. Our master bakers will craft it with perfection.</p>
                                                <button type="button" className="request-custom-btn" onClick={() => setIsCustomRequestModalOpen(true)}>
                                                    <RocketFilled /> Request a Custom Cake
                                                </button>
                                            </div>
                                        </div>

                                        <div className="section-title-wrapper">
                                            <h3 className="category-title">🎨 Customized & Theme Cakes</h3>
                                            <span className="category-subtitle">Handcrafted photo, 3D theme, and designer cakes</span>
                                        </div>

                                        <div className="cakes-grid">
                                            {filteredCustomCakes.map((cake) => (
                                                <article key={cake.id} className="sample-cake-card menu-cake-card" onClick={() => openCakeModal(cake)}>
                                                    <div className="card-image-box">
                                                        <img src={cake.image} alt={cake.name} />
                                                        <span className="diet-pill veg">🎨 {cake.category}</span>
                                                        <span className="rating-pill">{cake.rating} ★</span>
                                                        <button type="button" className="quick-add-btn" onClick={(e) => { e.stopPropagation(); addToCart({ ...cake, weight: '1 Kg' }); showToast('success', 'Added to Cart! 🛒', `${cake.name} has been added.`); }}>+</button>
                                                    </div>
                                                    <div className="card-content-box">
                                                        <h3 className="card-item-name">{cake.name}</h3>
                                                        <p className="card-item-desc">{cake.description}</p>
                                                        <div className="card-bottom-row">
                                                            <span className="current-price">{cake.price}</span>
                                                            <button type="button" className="add-cart-btn-sm" onClick={(e) => { e.stopPropagation(); addToCart({ ...cake, weight: '1 Kg' }); showToast('success', 'Added to Cart! 🛒', `${cake.name} has been added.`); }}>
                                                                Add +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* 3. DESSERTS & BAKERY SECTION */}
                                {(activeTab === 'ALL' || activeTab === 'DESSERTS') && filteredDesserts.length > 0 && (
                                    <section className="menu-category-section" id="desserts-section">
                                        <div className="section-title-wrapper">
                                            <h3 className="category-title">🧁 Desserts & Bakery Treats</h3>
                                            <span className="category-subtitle">Cupcakes, brownies, cookies, donuts, and fresh pastries</span>
                                        </div>

                                        <div className="cakes-grid">
                                            {filteredDesserts.map((item) => (
                                                <article key={item.id} className="sample-cake-card menu-cake-card" onClick={() => openCakeModal(item)}>
                                                    <div className="card-image-box">
                                                        <img src={item.image} alt={item.name} />
                                                        <span className="diet-pill veg">{item.isEggless ? '🌿 Eggless' : '🟢 Veg'}</span>
                                                        <span className="rating-pill">{item.rating} ★</span>
                                                        <button type="button" className="quick-add-btn" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, weight: '1 Pc' }); showToast('success', 'Added to Cart! 🛒', `${item.name} has been added.`); }}>+</button>
                                                    </div>
                                                    <div className="card-content-box">
                                                        <h3 className="card-item-name">{item.name}</h3>
                                                        <p className="card-item-desc">{item.description}</p>
                                                        <div className="card-bottom-row">
                                                            <span className="current-price">{item.price}</span>
                                                            <button type="button" className="add-cart-btn-sm" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, weight: '1 Pc' }); showToast('success', 'Added to Cart! 🛒', `${item.name} has been added.`); }}>
                                                                Add +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* 4. SNACKS & FAST FOOD SECTION */}
                                {(activeTab === 'ALL' || activeTab === 'SNACKS') && filteredSnacks.length > 0 && (
                                    <section className="menu-category-section" id="snacks-section">
                                        <div className="section-title-wrapper">
                                            <h3 className="category-title">🍔 Café Snacks & Fast Food</h3>
                                            <span className="category-subtitle">Freshly baked pizzas, burgers, fries, sandwiches, and wraps</span>
                                        </div>

                                        <div className="cakes-grid">
                                            {filteredSnacks.map((item) => {
                                                const selectedVariant = selectedVariants[item.id] || item.variants?.[0] || 'Regular';
                                                return (
                                                    <article key={item.id} className="sample-cake-card menu-cake-card" onClick={() => openCakeModal(item)}>
                                                        <div className="card-image-box">
                                                            <img src={item.image} alt={item.name} />
                                                            <span className="diet-pill veg">🟢 100% Veg</span>
                                                            <span className="rating-pill">{item.rating} ★</span>
                                                            <button type="button" className="quick-add-btn" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, weight: selectedVariant }); showToast('success', 'Added to Cart! 🛒', `${item.name} (${selectedVariant}) has been added.`); }}>+</button>
                                                        </div>
                                                        <div className="card-content-box">
                                                            <h3 className="card-item-name">{item.name}</h3>
                                                            <p className="card-item-desc">{item.description}</p>

                                                            {item.variants && (
                                                                <div className="variant-pills-row" onClick={(e) => e.stopPropagation()}>
                                                                    {item.variants.map(v => (
                                                                        <button 
                                                                            key={v}
                                                                            type="button" 
                                                                            className={`variant-pill ${selectedVariant === v ? 'active' : ''}`}
                                                                            onClick={() => setSelectedVariants(prev => ({ ...prev, [item.id]: v }))}
                                                                        >
                                                                            {v}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="card-bottom-row">
                                                                <span className="current-price">{item.price}</span>
                                                                <button type="button" className="add-cart-btn-sm" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, weight: selectedVariant }); showToast('success', 'Added to Cart! 🛒', `${item.name} has been added.`); }}>
                                                                    Add +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* 5. BEVERAGES SECTION */}
                                {(activeTab === 'ALL' || activeTab === 'BEVERAGES') && filteredBeverages.length > 0 && (
                                    <section className="menu-category-section" id="beverages-section">
                                        <div className="section-title-wrapper">
                                            <h3 className="category-title">☕ Tea, Coffee & Beverages</h3>
                                            <span className="category-subtitle">Aromatic hot brews, iced cold coffees, shakes & fresh juices</span>
                                        </div>

                                        <div className="cakes-grid">
                                            {filteredBeverages.map((item) => {
                                                const selectedVariant = selectedVariants[item.id] || item.variants?.[0] || 'Regular';
                                                return (
                                                    <article key={item.id} className="sample-cake-card menu-cake-card" onClick={() => openCakeModal(item)}>
                                                        <div className="card-image-box">
                                                            <img src={item.image} alt={item.name} />
                                                            <span className="diet-pill veg">☕ Café Special</span>
                                                            <span className="rating-pill">{item.rating} ★</span>
                                                            <button type="button" className="quick-add-btn" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, weight: selectedVariant }); showToast('success', 'Added to Cart! 🛒', `${item.name} has been added.`); }}>+</button>
                                                        </div>
                                                        <div className="card-content-box">
                                                            <h3 className="card-item-name">{item.name}</h3>
                                                            <p className="card-item-desc">{item.description}</p>

                                                            {item.variants && (
                                                                <div className="variant-pills-row" onClick={(e) => e.stopPropagation()}>
                                                                    {item.variants.map(v => (
                                                                        <button 
                                                                            key={v}
                                                                            type="button" 
                                                                            className={`variant-pill ${selectedVariant === v ? 'active' : ''}`}
                                                                            onClick={() => setSelectedVariants(prev => ({ ...prev, [item.id]: v }))}
                                                                        >
                                                                            {v}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="card-bottom-row">
                                                                <span className="current-price">{item.price}</span>
                                                                <button type="button" className="add-cart-btn-sm" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, weight: selectedVariant }); showToast('success', 'Added to Cart! 🛒', `${item.name} has been added.`); }}>
                                                                    Add +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* 6. PARTY ESSENTIALS SECTION */}
                                {(activeTab === 'ALL' || activeTab === 'PARTY') && filteredParty.length > 0 && (
                                    <section className="menu-category-section" id="party-section">
                                        <div className="section-title-wrapper">
                                            <h3 className="category-title">🎉 Party Essentials & Celebrations</h3>
                                            <span className="category-subtitle">Balloons, fairy lights, cake toppers, candles & decoration kits</span>
                                        </div>

                                        <div className="cakes-grid">
                                            {filteredParty.map((item) => (
                                                <article key={item.id} className="sample-cake-card menu-cake-card" onClick={() => openCakeModal(item)}>
                                                    <div className="card-image-box">
                                                        <img src={item.image} alt={item.name} />
                                                        <span className="diet-pill veg">🎈 Party Item</span>
                                                        <button type="button" className="quick-add-btn" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, weight: '1 Pc' }); showToast('success', 'Added to Cart! 🛒', `${item.name} has been added.`); }}>+</button>
                                                    </div>
                                                    <div className="card-content-box">
                                                        <h3 className="card-item-name">{item.name}</h3>
                                                        <p className="card-item-desc">Make your birthday or anniversary celebration extra special!</p>
                                                        <div className="card-bottom-row">
                                                            <span className="current-price">{item.price}</span>
                                                            <button type="button" className="add-cart-btn-sm" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, weight: '1 Pc' }); showToast('success', 'Added to Cart! 🛒', `${item.name} has been added.`); }}>
                                                                Add +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </section>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Slide Drawer */}
            {isMobileFilterOpen && (
                <div className="mobile-filter-backdrop" onClick={() => setIsMobileFilterOpen(false)}>
                    <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-filter-drawer-header">
                            <span>Filter & Sort Menu</span>
                            <button type="button" className="close-btn" onClick={() => setIsMobileFilterOpen(false)}>✕</button>
                        </div>
                        <div className="mobile-filter-drawer-body">
                            {renderSidebarFilterContent()}
                        </div>
                        <div className="mobile-filter-drawer-footer">
                            <button type="button" className="apply-filter-btn" onClick={() => setIsMobileFilterOpen(false)}>
                                Apply Filters ({totalFilteredCount})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Quick View Modal - Responsive 2-Column Layout */}
            <Modal 
                open={!!selectedCake} 
                onCancel={() => setSelectedCake(null)} 
                footer={null} 
                className="cake-details-modal" 
                destroyOnClose
                centered
                width={860}
            >
                {selectedCake && (() => {
                    const itemId = selectedCake.id;
                    const isCakeType = selectedCake.type === 'cake' || !selectedCake.type;
                    const scaled = isCakeType ? getScaledPrices(itemId, selectedCake.price) : { price: selectedCake.price, originalPrice: '', weightText: selectedVariants[itemId] || '1 Pc', servesText: 'Standard Serving' };
                    const currentWeight = selectedWeights[itemId] || '1';
                    const activeVariant = selectedVariants[itemId] || selectedCake.variants?.[0] || 'Standard';

                    return (
                        <div className="cake-modal-wrapper">
                            
                            {/* Top 2-Column Grid */}
                            <div className="cake-modal-main-grid">
                                
                                {/* Left Column: Image Box */}
                                <div className="modal-image-col">
                                    <div className="modal-img-wrapper">
                                        <img src={selectedCake.image} alt={selectedCake.name} />
                                        <div className="badge-row">
                                            {selectedCake.isEggless && <span className="modal-badge eggless">🌿 100% Eggless</span>}
                                            {selectedCake.isVeg && !selectedCake.isEggless && <span className="modal-badge veg">🟢 100% Pure Veg</span>}
                                            <span className="modal-badge rating">⭐ {selectedCake.rating || 4.8} / 5</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Details & Controls */}
                                <div className="modal-details-col">
                                    <h2 className="modal-item-title">{selectedCake.name}</h2>
                                    <p className="modal-item-desc">{selectedCake.description || 'Freshly prepared with premium quality ingredients for your celebration.'}</p>
                                    
                                    <div className="modal-price-row">
                                        <span className="modal-current-price">{scaled.price}</span>
                                        {scaled.originalPrice && <span className="modal-orig-price">{scaled.originalPrice}</span>}
                                        <span className="price-inclusive-text">(Inclusive of all taxes)</span>
                                    </div>

                                    {/* Cake Weight Dropdown Selector */}
                                    {isCakeType && (
                                        <div className="modal-option-block">
                                            <label className="option-label">Select Weight / Size:</label>
                                            <div className="custom-weight-dropdown-wrapper">
                                                <button 
                                                    type="button" 
                                                    className="weight-dropdown-pill modal-variant-selector"
                                                    onClick={() => setOpenDropdownId(openDropdownId === 'modal' ? null : 'modal')}
                                                >
                                                    <span className="weight-text">
                                                        {currentWeight === 'custom' ? `${customWeightVal || 6} Kg` : `${currentWeight} Kg`}
                                                    </span>
                                                    <span className="pink-arrow">▾</span>
                                                </button>

                                                {openDropdownId === 'modal' && (
                                                    <>
                                                        <div className="weight-dropdown-overlay" onClick={() => setOpenDropdownId(null)} />
                                                        <ul className="weight-dropdown-menu">
                                                            {['1', '2', '3', '4', '5'].map((kg) => (
                                                                <li 
                                                                    key={kg}
                                                                    className={currentWeight === kg ? 'active' : ''}
                                                                    onClick={() => {
                                                                        setSelectedWeights(prev => ({ ...prev, [itemId]: kg }));
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
                                                                    setCustomModalItem(selectedCake);
                                                                    setSelectedWeights(prev => ({ ...prev, [itemId]: 'custom' }));
                                                                    setOpenDropdownId(null);
                                                                }}
                                                            >
                                                                <span>Custom Weight (6+ Kg)...</span>
                                                            </li>
                                                        </ul>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Non-Cake Variant Pills */}
                                    {!isCakeType && selectedCake.variants && (
                                        <div className="modal-option-block">
                                            <label className="option-label">Select Variant:</label>
                                            <div className="modal-variant-pills">
                                                {selectedCake.variants.map(v => (
                                                    <button 
                                                        key={v}
                                                        type="button" 
                                                        className={`modal-v-pill ${activeVariant === v ? 'active' : ''}`}
                                                        onClick={() => setSelectedVariants(prev => ({ ...prev, [itemId]: v }))}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Message on Cake (For Cakes) */}
                                    {isCakeType && (
                                        <div className="modal-option-block">
                                            <label className="option-label">Cake Message (Optional):</label>
                                            <Input 
                                                placeholder="e.g. Happy Birthday Ananya! 🎉" 
                                                value={cakeMessage}
                                                onChange={(e) => setCakeMessage(e.target.value)}
                                                maxLength={40}
                                                allowClear
                                                className="cake-message-input"
                                            />
                                        </div>
                                    )}

                                    {/* Feature Highlights Grid */}
                                    <div className="modal-specs-grid">
                                        <div className="spec-item"><ClockCircleOutlined /> <span>Freshly Prepared</span></div>
                                        <div className="spec-item"><SafetyCertificateOutlined /> <span>100% Quality Guaranteed</span></div>
                                        <div className="spec-item"><RocketFilled /> <span>Quick Local Delivery</span></div>
                                    </div>

                                    {/* Add to Cart CTA */}
                                    <Button 
                                        type="primary" 
                                        className="modal-add-cart-btn"
                                        icon={<ShoppingCartOutlined />}
                                        onClick={() => { 
                                            addToCart({ 
                                                ...selectedCake, 
                                                price: scaled.price, 
                                                weight: isCakeType ? scaled.weightText : activeVariant,
                                                cakeMessage: cakeMessage 
                                            }); 
                                            setSelectedCake(null); 
                                            showToast('success', 'Added to Cart! 🛒', `${selectedCake.name} has been added.`); 
                                        }}
                                    >
                                        Add to Cart • {scaled.price}
                                    </Button>
                                </div>
                            </div>

                            {/* Recommended Party Essentials Section */}
                            <div className="modal-addons-section">
                                <div className="addons-header-text">
                                    <h4>🎉 Make Your Celebration Extra Special!</h4>
                                    <span>Pair candles, balloons & toppers with your order:</span>
                                </div>
                                <div className="addons-scroll-row">
                                    {partyEssentials.slice(0, 6).map(addon => {
                                        const isAdded = cartItems.some(c => c.id === addon.id);
                                        return (
                                            <div key={addon.id} className="addon-card-mini">
                                                <img src={addon.image} alt={addon.name} />
                                                <div className="addon-info">
                                                    <strong>{addon.name}</strong>
                                                    <span>{addon.price}</span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    className={`addon-add-btn ${isAdded ? 'added' : ''}`}
                                                    onClick={() => { addToCart({ ...addon, weight: '1 Pc' }); showToast('success', 'Party Addon Added! 🎉', `${addon.name} added to cart.`); }}
                                                >
                                                    {isAdded ? '✓ Added' : '+ Add'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Customer Reviews Section */}
                            <section className="review-section">
                                {(() => {
                                    const rawReviews = reviews[selectedCake.id] || [];
                                    const sampleUsers = [
                                        { name: "Ananya Sharma", avatar: "AS", rating: 5, time: "2 days ago", likes: 14 },
                                        { name: "Rahul Verma", avatar: "RV", rating: 5, time: "3 days ago", likes: 8 },
                                        { name: "Priya Patel", avatar: "PP", rating: 5, time: "1 week ago", likes: 11 }
                                    ];
                                    const normalizedReviews = rawReviews.map((item, idx) => {
                                        if (typeof item === 'string') {
                                            const pick = sampleUsers[idx % sampleUsers.length];
                                            return {
                                                id: `legacy-${idx}`,
                                                userName: pick.name,
                                                userAvatar: pick.avatar,
                                                rating: pick.rating,
                                                comment: item,
                                                date: pick.time,
                                                likes: pick.likes,
                                                isLiked: false
                                            };
                                        }
                                        return item;
                                    });

                                    return (
                                        <>
                                            <div className="review-heading">
                                                <h3>Customer Reviews 💬</h3>
                                                <span className="review-count-pill">{normalizedReviews.length} review(s)</span>
                                            </div>

                                            <div className="reviews-list-container">
                                                {normalizedReviews.length > 0 ? (
                                                    normalizedReviews.map((review) => (
                                                        <div className="review-item-card" key={review.id}>
                                                            <div className="review-user-avatar">
                                                                {review.userAvatar || 'CU'}
                                                            </div>
                                                            <div className="review-body">
                                                                <div className="review-card-top">
                                                                    <div className="user-meta">
                                                                        <strong className="user-name">{review.userName || 'Customer'}</strong>
                                                                        <span className="verified-badge" title="Verified Customer">✓</span>
                                                                    </div>
                                                                    <div className="review-stars-row">
                                                                        {'★'.repeat(review.rating || 5)}
                                                                    </div>
                                                                </div>
                                                                <p className="review-comment-text">{review.comment}</p>
                                                                <div className="review-card-footer">
                                                                    <span className="review-date-text">{review.date || 'Recently'}</span>
                                                                    <button 
                                                                        type="button" 
                                                                        className={`like-review-btn ${review.isLiked ? 'liked' : ''}`}
                                                                        onClick={() => toggleLikeReview(selectedCake.id, review.id)}
                                                                    >
                                                                        {review.isLiked ? '❤️' : '🤍'} {review.likes || 0} Likes
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-reviews-box">
                                                        <span className="sparkle-icon">✨</span>
                                                        <p>Be the first to share your sweet experience with this item!</p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}

                                <div className="review-input-box">
                                    <div className="rate-your-review-row">
                                        <span>Your Rating:</span>
                                        <Rate 
                                            value={commentRating} 
                                            onChange={(rating) => setCommentRating(rating)} 
                                        />
                                    </div>
                                    <Input.TextArea 
                                        value={reviewText} 
                                        onChange={(event) => setReviewText(event.target.value)} 
                                        placeholder="Write your review or thoughts here..." 
                                        rows={3} 
                                        maxLength={300} 
                                        showCount 
                                    />
                                    <button type="button" className="post-review-btn" onClick={saveReview}>
                                        Post Review ✨
                                    </button>
                                </div>
                            </section>

                        </div>
                    );
                })()}
            </Modal>

            {/* Custom Weight Selector Modal */}
            {customModalItem && (
                <div className="custom-weight-modal-backdrop" onClick={() => setCustomModalItem(null)}>
                    <div className="custom-weight-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setCustomModalItem(null)}>✕</button>
                        <h3>Custom Weight Selection</h3>
                        <p>Specify custom weight for <strong>{customModalItem.name}</strong>:</p>
                        <div className="custom-input-group">
                            <label htmlFor="modal-custom-kg-input">Enter Weight in Kg (e.g. 6, 10, 15):</label>
                            <input 
                                id="modal-custom-kg-input"
                                type="number" 
                                min="6" 
                                max="50"
                                value={customWeightVal}
                                onChange={(e) => setCustomWeightVal(e.target.value)}
                            />
                        </div>
                        <button type="button" className="apply-custom-kg-btn" onClick={() => setCustomModalItem(null)}>
                            Apply Custom Weight
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Cake Request Modal */}
            <Modal
                open={isCustomRequestModalOpen}
                onCancel={() => setIsCustomRequestModalOpen(false)}
                footer={null}
                className="custom-cake-request-modal"
                destroyOnClose
                title="🎂 Request a Custom Cake"
            >
                <form className="custom-cake-form" onSubmit={handleCustomRequestSubmit}>
                    <p className="form-subtitle">Have a dream cake design in mind? Fill out your details below and our bakers will bring your dream cake to life!</p>
                    
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Your Name *</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="e.g. Rahul Sharma"
                                value={customFormData.customerName}
                                onChange={(e) => setCustomFormData({ ...customFormData, customerName: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Mobile Number *</label>
                            <input 
                                type="tel" 
                                required 
                                placeholder="e.g. +91 98765 43210"
                                value={customFormData.mobileNumber}
                                onChange={(e) => setCustomFormData({ ...customFormData, mobileNumber: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Event Date</label>
                            <input 
                                type="date" 
                                value={customFormData.eventDate}
                                onChange={(e) => setCustomFormData({ ...customFormData, eventDate: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Cake Weight / Servings</label>
                            <select 
                                value={customFormData.servingsWeight}
                                onChange={(e) => setCustomFormData({ ...customFormData, servingsWeight: e.target.value })}
                            >
                                <option value="1 kg (6-8 People)">1 kg (6–8 People)</option>
                                <option value="2 kg (12-16 People)">2 kg (12–16 People)</option>
                                <option value="3 kg (20-24 People)">3 kg (20–24 People)</option>
                                <option value="5+ kg (Grand Celebration)">5+ kg (Grand Celebration)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Preferred Flavour</label>
                            <select 
                                value={customFormData.preferredFlavour}
                                onChange={(e) => setCustomFormData({ ...customFormData, preferredFlavour: e.target.value })}
                            >
                                <option value="Chocolate Truffle">Chocolate Truffle</option>
                                <option value="Classic Butterscotch">Classic Butterscotch</option>
                                <option value="Red Velvet Cream Cheese">Red Velvet Cream Cheese</option>
                                <option value="Fresh Exotic Fruit">Fresh Exotic Fruit</option>
                                <option value="Pistachio Rasamalai">Pistachio Rasamalai</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Budget Range</label>
                            <select 
                                value={customFormData.budgetRange}
                                onChange={(e) => setCustomFormData({ ...customFormData, budgetRange: e.target.value })}
                            >
                                <option value="Under ₹1,000">Under ₹1,000</option>
                                <option value="₹1,000 - ₹2,000">₹1,000 – ₹2,000</option>
                                <option value="₹2,000 - ₹5,000">₹2,000 – ₹5,000</option>
                                <option value="Above ₹5,000">Above ₹5,000</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Custom Requirements & Message</label>
                        <textarea 
                            rows={3} 
                            placeholder="Describe theme, colors, name on cake, or special dietary requirements..."
                            value={customFormData.description}
                            onChange={(e) => setCustomFormData({ ...customFormData, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Upload Reference Image (Optional)</label>
                        <div className="file-upload-box">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                id="custom-cake-img-input"
                            />
                            <label htmlFor="custom-cake-img-input" className="upload-label-btn">
                                <UploadOutlined /> Choose Reference Design Image
                            </label>
                            {customFormData.imagePreview && (
                                <div className="img-preview-box">
                                    <img src={customFormData.imagePreview} alt="Reference Preview" />
                                    <span>Reference Image Uploaded ✓</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="submit-custom-request-btn">
                        Submit Custom Cake Request ✨
                    </button>
                </form>
            </Modal>

            {/* Floating Quick Cart Link */}
            <Link to="/cart" className="menu-cart-link">
                View Cart ({cartItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}) 🛒
            </Link>
        </main>
    );
};

export default Menu;
