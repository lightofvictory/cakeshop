import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  MenuOutlined, 
  CloseOutlined, 
  CoffeeOutlined, 
  ShopOutlined, 
  DownOutlined 
} from '@ant-design/icons';
import "./Navbar.scss";

const ScooterDeliveryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.5 17h2c.6 0 1-.4 1-1v-3.2c0-.8-.6-1.5-1.4-1.7L16 10s-1.2-1.5-2-2.3c-.5-.5-1.2-.7-1.9-.7H9" />
    <path d="M9 17h6" />
    <circle cx="6.5" cy="17" r="2.5" />
    <circle cx="17.5" cy="17" r="2.5" />
    <rect x="2" y="7" width="6.5" height="6.5" rx="1" strokeWidth="2" />
  </svg>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const { itemCount, orderPreference, openPreferenceModal } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Menu", path: "/menu" },
    { name: "Extra Special ✨", path: "/extra-special" },
    { name: "Contact Us", path: "/contact" }
  ];

  const getModeIcon = () => {
    if (orderPreference?.mode === 'dinein') return <CoffeeOutlined />;
    if (orderPreference?.mode === 'pickup') return <ShopOutlined />;
    return <ScooterDeliveryIcon />;
  };

  const getModeLabel = () => {
    if (orderPreference?.mode === 'dinein') return 'Dine In';
    if (orderPreference?.mode === 'pickup') return 'Pick Up';
    return 'Delivery';
  };

  const modeLabel = getModeLabel();
  const dateText = orderPreference?.formattedDate || 'Today';
  const timeText = orderPreference?.formattedTime || '10:00 AM - 12:00 PM';

  return (
    <nav className={`navbar-container ${isScrolled ? "scrolled" : ""} ${location.pathname === '/' ? 'home-navbar' : 'page-navbar'}`}>
      <div className="navbar-content">
        
        {/* Left Section: Logo & Order Preference Pill */}
        <div className="navbar-left-group">
          <div className="navbar-brand">
            <img src={assets.pastry} alt="Mr. Pastry Logo" className="navbar-logo" />
            <Link to="/">Mr. Pastry</Link>
          </div>

          {/* Clean Order Preference Header Pill */}
          <button 
            type="button" 
            className="order-pref-header-btn" 
            onClick={openPreferenceModal}
            title="Change order type & schedule"
          >
            <span className="mode-icon">{getModeIcon()}</span>
            <span className="pref-text desktop-pref-text">
              <strong>{modeLabel}</strong> • {dateText}, {timeText}
            </span>
            <span className="pref-text mobile-pref-text">
              <strong>{modeLabel}</strong>
            </span>
            <span className="edit-arrow"><DownOutlined style={{ fontSize: '1rem' }} /></span>
          </button>
        </div>

        {/* Center Section: Desktop Navigation Links */}
        <ul className="navbar-menu desktop-only-menu">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  className={isActive ? "active" : ""}
                >
                  {item.name}
                </Link>
                <span className={`underline-bar ${isActive ? "active" : ""}`}></span>
              </li>
            );
          })}
        </ul>

        {/* Right Section: Actions & Mobile Hamburger */}
        <div className="navbar-actions">
          <Link 
            to={user ? "/profile" : "/signin"} 
            className="account-icon-btn desktop-only-link" 
            title={user ? 'Profile' : 'Sign in'}
            aria-label={user ? 'Profile' : 'Sign in'}
          >
            <UserOutlined style={{ fontSize: '1.9rem' }} />
          </Link>
          
          <Link 
            to="/cart" 
            className="cart-icon-btn" 
            aria-label={`Shopping cart with ${itemCount} items`}
            title="Shopping Cart"
          >
            <ShoppingCartOutlined style={{ fontSize: '2.1rem' }} />
            {itemCount > 0 && (
              <span className="cart-badge-count">{itemCount}</span>
            )}
          </Link>

          {/* Mobile Hamburger Button */}
          <button 
            type="button" 
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileNavOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Dedicated Order Preference Bar */}
      <div className="mobile-order-bar-container">
        <button 
          type="button" 
          className="mobile-order-bar-btn"
          onClick={openPreferenceModal}
        >
          <span className="icon">{getModeIcon()}</span>
          <span className="text">
            <strong>{modeLabel}</strong> • {dateText}, {timeText}
          </span>
          <span className="change-link">Change ▾</span>
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setIsMobileNavOpen(false)}>
          <div className="mobile-drawer-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="drawer-title">Navigation</span>
              <button type="button" className="close-drawer-btn" onClick={() => setIsMobileNavOpen(false)}>✕</button>
            </div>
            
            <div className="mobile-pref-banner" onClick={() => { setIsMobileNavOpen(false); openPreferenceModal(); }}>
              <span className="icon">{getModeIcon()}</span>
              <div>
                <strong>{modeLabel} Order</strong>
                <p>{dateText} • {timeText}</p>
              </div>
              <span className="arrow">Change ▾</span>
            </div>

            <ul className="mobile-nav-list">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className={location.pathname === item.path ? "active" : ""}
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mobile-drawer-footer">
              <Link 
                to={user ? "/profile" : "/signin"} 
                className="mobile-account-btn"
                onClick={() => setIsMobileNavOpen(false)}
              >
                {user ? '👤 My Profile' : '🔑 Sign In / Register'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
