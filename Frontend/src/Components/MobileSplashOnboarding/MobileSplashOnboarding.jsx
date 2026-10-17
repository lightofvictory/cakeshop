import React, { useState, useEffect } from 'react';
import splash1 from '../../assets/splash1.png';
import splash2 from '../../assets/splash2.png';
import splash3 from '../../assets/splash3.png';
import './MobileSplashOnboarding.scss';

const slides = [
  {
    id: 1,
    image: splash1,
    title: 'Find your Best cakes',
    subtitle: 'order your yummy cakes',
    buttonText: 'Get Started',
  },
  {
    id: 2,
    image: splash2,
    title: 'Freshly Baked Daily',
    subtitle: 'handcrafted with love & organic cocoa',
    buttonText: 'Get Started',
  },
  {
    id: 3,
    image: splash3,
    title: 'Express Local Delivery',
    subtitle: 'delivered fresh right to your doorstep',
    buttonText: 'Get Started',
  },
];

const MobileSplashOnboarding = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto-scroll slides every 5 seconds (5000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 40) {
      // Swiped Left -> Next Slide
      if (currentIndex < slides.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }
    if (distance < -40) {
      // Swiped Right -> Previous Slide
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="mobile-splash-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image Carousel Track */}
      <div className="splash-bg-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {slides.map((slide) => (
          <div className="splash-bg-slide" key={slide.id}>
            <img src={slide.image} alt={slide.title} />
          </div>
        ))}
      </div>

      {/* Bottom Content Sheet Card with Teardrop Badge */}
      <div className="splash-bottom-sheet">
        {/* Teardrop / Waterdrop Floating Pink Badge */}
        <div className="teardrop-badge-wrapper">
          <svg className="teardrop-svg" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M30 2C30 2 54 28 54 44C54 57.2548 43.2548 68 30 68C16.7452 68 6 57.2548 6 44C6 28 30 2 30 2Z"
              fill="#D91B5C"
            />
          </svg>
        </div>

        {/* Slide Title & Subtitle */}
        <div className="sheet-content animate-slide-fade" key={currentSlide.id}>
          <h1 className="sheet-title">{currentSlide.title}</h1>
          <p className="sheet-subtitle">{currentSlide.subtitle}</p>

          {/* Dots Indicator */}
          <div className="dots-indicator-row">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${currentIndex === idx ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              ></span>
            ))}
          </div>

          {/* Primary Action Button */}
          <button className="get-started-btn" onClick={handleNext}>
            {currentSlide.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSplashOnboarding;
