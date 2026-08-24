import { assets } from '../../assets/assets.js';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  return (
    <header className="hero-section">
      {/* Decorative Background Elements */}
      <div className="decor-shape-1"></div>
      <div className="decor-shape-2"></div>
      <div className="decor-line-1"></div>
      <div className="decor-line-2"></div>
      <div className="decor-circle"></div>
      
      <div className="hero-content">
        {/* Left Text Column */}
        <div className="hero-text">
          <div className="hero-badge">Freshly baked every day</div>
          <h1 className="hero-title">
            The Best Cakes <br />
            <span className="highlight-text">For Every Celebration</span>
          </h1>
          <p className="hero-description">
            Beautifully made cakes, pastries, and sweet moments from the Mr. Pastry kitchen.
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn-primary">
              Explore Cakes
            </Link>
            <Link to="/contact" className="btn-secondary">
              Custom Order
            </Link>
          </div>
        </div>

        {/* Right Visual Column */}
        <div className="hero-visual">
          <div className="ring-outer"></div>
          <div className="ring-inner"></div>
          
          <div className="image-container">
            <img 
              src={assets.bakeryHero} 
              alt="Fresh artisan baked goods from Mr. Pastry" 
            />
          </div>
          
          <div className="accent-block-1"></div>
          <div className="accent-block-2"></div>
        </div>
      </div>

      {/* Smooth Vector Wave Divider */}
      <div className="hero-wave-divider">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 25C360 75 1080 75 1440 25V80H0V25Z" fill="#ffffff" />
        </svg>
      </div>
    </header>
  );
};

export default Header;
