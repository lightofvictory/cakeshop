import { assets } from '../../assets/assets.js';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import './Header.scss';

const Header = () => {
  const { settings } = useSettings();
  const heroImg = settings?.bannerImage ? `http://localhost:3000/images/${settings.bannerImage}` : assets.bakeryHero;

  return (
    <header className="hero-section">
      <div className="decor-shape-1"></div>
      <div className="decor-shape-2"></div>
      <div className="decor-line-1"></div>
      <div className="decor-line-2"></div>
      <div className="decor-circle"></div>

      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">Freshly baked every day</div>
          <h1 className="hero-title">
            {settings?.heroTitle || 'The Best Cakes For Every Celebration'}
          </h1>
          <p className="hero-description">
            {settings?.heroSubtitle || 'Beautifully made cakes, pastries, and sweet moments from the kitchen.'}
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

        <div className="hero-visual">
          <div className="ring-outer"></div>
          <div className="ring-inner"></div>

          <div className="image-container">
            <img src={heroImg} alt="Fresh artisan baked goods" />
          </div>

          <div className="accent-block-1"></div>
          <div className="accent-block-2"></div>
        </div>
      </div>

      <div className="hero-wave-divider">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 25C360 75 1080 75 1440 25V80H0V25Z" fill="#ffffff" />
        </svg>
      </div>
    </header>
  );
};

export default Header;
