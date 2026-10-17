import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets.js';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import './Header.scss';

const Header = () => {
  const { settings } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const isHeroVisible = settings?.showHero ?? true;

  const defaultBannerImg = settings?.bannerImage || settings?.homeSettings?.bannerImage;
  const defaultHeroImg = defaultBannerImg
    ? defaultBannerImg.startsWith('http') || defaultBannerImg.startsWith('/')
      ? defaultBannerImg
      : `http://localhost:3000/images/${defaultBannerImg}`
    : assets.bakeryHero;

  const heroBanners =
    settings?.homeSettings?.heroBanners &&
    Array.isArray(settings.homeSettings.heroBanners) &&
    settings.homeSettings.heroBanners.length > 0
      ? settings.homeSettings.heroBanners
      : settings?.heroBanners && Array.isArray(settings.heroBanners) && settings.heroBanners.length > 0
      ? settings.heroBanners
      : [];

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && heroBanners.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }
    if (distance < -50 && heroBanners.length > 0) {
      setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1));
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!isHeroVisible) return null;

  const activeSlide = heroBanners.length > 0 ? (heroBanners[currentSlide] || heroBanners[0]) : null;

  const heroEyebrow = activeSlide?.title || 'Freshly baked every day';
  const heroTitle = activeSlide?.subtitle || settings?.heroTitle || settings?.homeSettings?.heroTitle || 'The Best Cakes For Every Celebration';
  const heroSubtitle = activeSlide?.description || settings?.heroSubtitle || settings?.homeSettings?.heroSubtitle || 'Beautifully made cakes, pastries, and sweet moments from the kitchen.';
  const heroCtaText = activeSlide?.ctaText || settings?.heroCtaText || settings?.homeSettings?.heroCtaText || 'Explore Cakes';
  const heroCtaLink = activeSlide?.ctaLink || '/menu';

  const getSlideImageUrl = (img) => {
    if (!img) return defaultHeroImg;
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

  const slidesToRender =
    heroBanners.length > 0
      ? heroBanners
      : [
          {
            title: heroEyebrow,
            subtitle: heroTitle,
            description: heroSubtitle,
            ctaText: heroCtaText,
            ctaLink: heroCtaLink,
            image: defaultHeroImg,
          },
        ];

  return (
    <header
      className="hero-section"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-content">
        <div className="hero-text-container">
          {(() => {
            const slide = slidesToRender[currentSlide] || slidesToRender[0];
            return (
              <div key={`slide-${currentSlide}`} className="hero-text-slide animate-fade-in">
                <div className="hero-badge">{slide?.title || 'Freshly baked every day'}</div>
                <h1 className="hero-title">{slide?.subtitle || 'The Best Cakes For Every Celebration'}</h1>
                <p className="hero-description">{slide?.description || 'Beautifully made cakes, pastries, and sweet moments from the kitchen.'}</p>
                <div className="hero-buttons">
                  <Link to={slide?.ctaLink || '/menu'} className="btn-primary">
                    {slide?.ctaText || 'Explore Cakes'}
                  </Link>
                  <Link to="/contact" className="btn-secondary">
                    Custom Order
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="hero-visual">
          <div className="image-container-crossfade">
            {slidesToRender.map((slide, idx) => {
              const isActive = currentSlide === idx;
              const imgUrl = getSlideImageUrl(slide.image);
              return (
                <div key={idx} className={`slide-image-layer ${isActive ? 'active' : ''}`}>
                  <img src={imgUrl} alt={slide.title || "Hero Banner Slide"} />
                </div>
              );
            })}
          </div>

          {slidesToRender.length > 1 && (
            <div className="desktop-hero-dots">
              {slidesToRender.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot-pill ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          )}
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
