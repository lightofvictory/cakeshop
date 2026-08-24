import { cakeImages } from '../../assets/cakeimages/Menus_Image.js';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Button, Input, Modal, Rate } from 'antd';
import { partyEssentials } from '../../assets/partyEssentials';
import { 
  FilterOutlined, 
  SearchOutlined, 
  CloseOutlined, 
  ReloadOutlined, 
  StarFilled 
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
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [customModalItem, setCustomModalItem] = useState(null);
    const [customWeightVal, setCustomWeightVal] = useState('6');
    const [reviewText, setReviewText] = useState('');
    const [commentRating, setCommentRating] = useState(5);

    // Sidebar Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
    const [selectedPriceFilter, setSelectedPriceFilter] = useState('ALL');
    const [selectedRatingFilter, setSelectedRatingFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('DEFAULT');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('mr-pastry-ratings', JSON.stringify(ratings));
    }, [ratings]);

    useEffect(() => {
        localStorage.setItem('mr-pastry-reviews', JSON.stringify(reviews));
    }, [reviews]);

    const openCakeModal = (cake) => {
        setSelectedCake(cake);
        setReviewText('');
        setCommentRating(5);
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

    // Flatten all items for filter & search calculations
    const allCategorizedItems = useMemo(() => {
        const list = [];
        Object.keys(cakeImages).forEach(cat => {
            cakeImages[cat].forEach(item => {
                const itemId = `${cat}-${item.name}`;
                list.push({
                    ...item,
                    id: itemId,
                    categoryKey: cat,
                    categoryName: categoryLabels[cat] || cat,
                    ratingVal: 4.8,
                    numericPrice: parseInt(item.price?.replace(/[^0-9]/g, '') || '499')
                });
            });
        });
        return list;
    }, []);

    // Filtered Items logic
    const filteredGroupedItems = useMemo(() => {
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
                    numericPrice: numPrice
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

            // 4. Sorting
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
    }, [searchQuery, selectedCategoryFilter, selectedPriceFilter, selectedRatingFilter, sortBy]);

    const totalFilteredCount = Object.values(filteredGroupedItems).reduce((acc, curr) => acc + curr.length, 0);
    const hasActiveFilters = searchQuery || selectedCategoryFilter !== 'ALL' || selectedPriceFilter !== 'ALL' || selectedRatingFilter !== 'ALL' || sortBy !== 'DEFAULT';

    const resetAllFilters = () => {
        setSearchQuery('');
        setSelectedCategoryFilter('ALL');
        setSelectedPriceFilter('ALL');
        setSelectedRatingFilter('ALL');
        setSortBy('DEFAULT');
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
                <label>Search Cakes</label>
                <div className="search-input-box">
                    <SearchOutlined className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by name (e.g. Butterscotch)..." 
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
                <label>Category</label>
                <div className="filter-options-list">
                    <button 
                        type="button" 
                        className={`filter-chip ${selectedCategoryFilter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setSelectedCategoryFilter('ALL')}
                    >
                        All Categories
                    </button>
                    {Object.keys(cakeImages).map((cat) => (
                        <button 
                            key={cat}
                            type="button"
                            className={`filter-chip ${selectedCategoryFilter === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategoryFilter(cat)}
                        >
                            {categoryLabels[cat] || cat}
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

            {/* Rating Filter */}
            <div className="filter-group">
                <label>Reviews & Rating</label>
                <div className="filter-options-list">
                    {[
                        { key: 'ALL', label: 'All Ratings' },
                        { key: '4.8', label: '4.8 ★ & Above' },
                        { key: '4.5', label: '4.5 ★ & Above' }
                    ].map(r => (
                        <button 
                            key={r.key}
                            type="button"
                            className={`filter-chip ${selectedRatingFilter === r.key ? 'active' : ''}`}
                            onClick={() => setSelectedRatingFilter(r.key)}
                        >
                            {r.label}
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
            {/* Background elements */}
            <div className="menu-decor-circle-1"></div>
            <div className="menu-decor-circle-2"></div>

            <div className="menu-page-content">
                
                {/* Section Header */}
                <div className="menu-section-header">
                    <span className="menu-badge">Discover</span>
                    <h2 className="menu-title">Our <span>Menu</span></h2>
                </div>

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
                            <span>Showing <strong>{totalFilteredCount}</strong> delicious gourmet cakes</span>
                            {hasActiveFilters && (
                                <button type="button" className="clear-all-pill" onClick={resetAllFilters}>
                                    Clear Filters ✕
                                </button>
                            )}
                        </div>

                        {totalFilteredCount === 0 ? (
                            <div className="no-filtered-results">
                                <span className="no-res-icon">🎂</span>
                                <h3>No cakes match your filters</h3>
                                <p>Try clearing your search query or adjusting your price/rating filters.</p>
                                <button type="button" className="reset-btn" onClick={resetAllFilters}>Reset All Filters</button>
                            </div>
                        ) : (
                            <div className="menu-categories-wrapper">
                                {Object.keys(filteredGroupedItems).map((category) => (
                                    <div key={category} className="menu-category-section">
                                        <h3 className="category-title">
                                            ~ {categoryLabels[category] || category.replace('_', ' ')} ~
                                        </h3>
                                        
                                        <div className="cakes-grid">
                                            {filteredGroupedItems[category].map((item) => {
                                                const itemId = item.id;
                                                const cartItem = cartItems.find((cartCake) => cartCake.id === itemId);
                                                const scaled = getScaledPrices(itemId, item.price);
                                                const currentWeight = selectedWeights[itemId] || '1';

                                                return <article key={itemId} className="sample-cake-card menu-cake-card" onClick={() => openCakeModal({ ...item, id: itemId })}>
                                                    <div className="card-image-box">
                                                        <img src={item.image} alt={item.name} />
                                                        <span className="delivery-time-tag">25 MINS</span>
                                                        <span className="rating-pill">4.8 ★</span>
                                                        <button type="button" className="quick-add-btn" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, id: itemId, price: scaled.price, weight: scaled.weightText }); }} aria-label={`Add ${item.name} to cart`}>+</button>
                                                    </div>
                                                    <div className="card-content-box">
                                                        <h3 className="card-item-name">{item.name}</h3>
                                                        <p className="card-item-desc">Freshly baked gourmet cake with premium ingredients and rich frosting.</p>
                                                        
                                                        {/* Custom Popover Weight Selector */}
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
                                                                                setCustomModalItem({ ...item, id: itemId });
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

                                                        <div className="card-price-offer-row">
                                                            <span className="card-discount-badge">20% OFF</span>
                                                            <div className="card-price-group">
                                                                <strong className="card-current-price">{scaled.price}</strong>
                                                                <span className="card-original-price">{scaled.originalPrice}</span>
                                                            </div>
                                                        </div>
                                                        {cartItem ? (
                                                            <div className="menu-quantity-control" onClick={(e) => e.stopPropagation()} aria-label={`${item.name} quantity`}>
                                                                <button onClick={() => updateQuantity(itemId, cartItem.quantity - 1)} aria-label={`Remove one ${item.name}`}>−</button>
                                                                <span>{cartItem.quantity}</span>
                                                                <button onClick={() => updateQuantity(itemId, cartItem.quantity + 1)} aria-label={`Add one more ${item.name}`}>+</button>
                                                            </div>
                                                        ) : (
                                                            <button type="button" className="add-to-cart-button card-order-btn" onClick={(e) => { e.stopPropagation(); addToCart({ ...item, id: itemId, price: scaled.price, weight: scaled.weightText }); }}>Add to cart</button>
                                                        )}
                                                    </div>
                                                </article>
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <Link to="/cart" className="menu-cart-link">View your cart</Link>
            </div>

            {/* Mobile Filter Slide Drawer */}
            {isMobileFilterOpen && (
                <div className="mobile-filter-backdrop" onClick={() => setIsMobileFilterOpen(false)}>
                    <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-filter-drawer-header">
                            <span>Filter & Sort Menu</span>
                            <button type="button" className="close-btn" onClick={() => setIsMobileFilterOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="mobile-filter-drawer-body">
                            {renderSidebarFilterContent()}
                        </div>
                        <div className="mobile-filter-drawer-footer">
                            <button type="button" className="apply-filter-btn" onClick={() => setIsMobileFilterOpen(false)}>
                                Apply Filters ({totalFilteredCount} items)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cake Details Modal */}
            <Modal open={Boolean(selectedCake)} onCancel={() => setSelectedCake(null)} footer={null} centered width={720} className="cake-details-modal" title={selectedCake?.name}>
                {selectedCake && (() => {
                    const scaled = getScaledPrices(selectedCake.id, selectedCake.price);
                    const currentWeight = selectedWeights[selectedCake.id] || '1';
                    const modalDropdownId = `modal-${selectedCake.id}`;

                    return (
                        <div className="cake-modal-content">
                            <img src={selectedCake.image} alt={selectedCake.name} />
                            <div className="cake-modal-info">
                                <p className="modal-price">{scaled.price}</p>
                                
                                {/* Custom Popover Weight Selector inside Modal */}
                                <div className="modal-weight-selector-row">
                                    <span className="weight-label">Select Weight:</span>
                                    <div className="custom-weight-dropdown-wrapper">
                                        <button 
                                            type="button" 
                                            className="weight-dropdown-pill"
                                            onClick={() => setOpenDropdownId(openDropdownId === modalDropdownId ? null : modalDropdownId)}
                                        >
                                            <span className="weight-text">
                                                {currentWeight === 'custom' ? `${customWeightVal || 6} Kg` : `${currentWeight} Kg`}
                                            </span>
                                            <span className="pink-arrow">▾</span>
                                        </button>

                                        {openDropdownId === modalDropdownId && (
                                            <>
                                                <div className="weight-dropdown-overlay" onClick={() => setOpenDropdownId(null)} />
                                                <ul className="weight-dropdown-menu">
                                                    {['1', '2', '3', '4', '5'].map((kg) => (
                                                        <li 
                                                            key={kg}
                                                            className={currentWeight === kg ? 'active' : ''}
                                                            onClick={() => {
                                                                setSelectedWeights(prev => ({ ...prev, [selectedCake.id]: kg }));
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
                                                            setSelectedWeights(prev => ({ ...prev, [selectedCake.id]: 'custom' }));
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

                                <div className="cake-tags">
                                    <span>Freshly baked</span>
                                    <span>Made to order</span>
                                </div>
                                <p>Freshly baked by Mr. Pastry for your sweet celebrations. Rich layers, balanced sweetness, and a finish made to share.</p>
                                <dl className="cake-specs">
                                    <div><dt>Serves</dt><dd>{scaled.servesText}</dd></div>
                                    <div><dt>Preparation</dt><dd>24 hours</dd></div>
                                    <div><dt>Storage</dt><dd>Keep chilled</dd></div>
                                </dl>
                                <div className="modal-rating">
                                    <span>Your rating</span>
                                    <Rate value={ratings[selectedCake.id] || 0} onChange={(rating) => setRatings({ ...ratings, [selectedCake.id]: rating })} />
                                    <small>{ratings[selectedCake.id] ? 'Thanks for sharing your rating!' : 'Select a star to rate this cake.'}</small>
                                </div>

                                {/* Recommended Party Essentials Add-ons */}
                                <div className="modal-addons-section">
                                    <h4>🎉 Make Your Celebration Extra Special!</h4>
                                    <p className="addons-subtitle">Add candles, balloons & toppers to your cake order:</p>
                                    <div className="addons-scroll-row">
                                        {partyEssentials.filter(p => p.isRecommended).map(addon => {
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
                                                        onClick={() => addToCart({ ...addon, weight: '1 Pc' })}
                                                    >
                                                        {isAdded ? '✓ Added' : '+ Add'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Button type="primary" onClick={() => { addToCart({ ...selectedCake, price: scaled.price, weight: scaled.weightText }); setSelectedCake(null); }}>Add to cart</Button>
                            </div>
                            <section className="review-section">
                                {(() => {
                                    const rawReviews = reviews[selectedCake.id] || [];
                                    const sampleUsers = [
                                        { name: "Ananya Sharma", avatar: "AS", rating: 5, time: "2 days ago", likes: 14 },
                                        { name: "Rahul Verma", avatar: "RV", rating: 5, time: "3 days ago", likes: 8 },
                                        { name: "Priya Patel", avatar: "PP", rating: 5, time: "1 week ago", likes: 11 },
                                        { name: "Vikram Singh", avatar: "VS", rating: 4, time: "2 weeks ago", likes: 6 }
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
                                                        <p>Be the first to share your sweet experience with this cake!</p>
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

            {/* Custom Weight Modal */}
            {customModalItem && (
                <div className="custom-weight-modal-backdrop" onClick={() => setCustomModalItem(null)}>
                    <div className="custom-weight-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setCustomModalItem(null)}>✕</button>
                        <h3>Custom Weight & Type</h3>
                        <p>Specify your custom weight requirement for <strong>{customModalItem.name}</strong>:</p>
                        <div className="custom-input-group">
                            <label htmlFor="modal-custom-kg-input">Enter Weight in Kg:</label>
                            <div className="input-row">
                                <input 
                                    id="modal-custom-kg-input"
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
        </main>
    );
};

export default Menu;
