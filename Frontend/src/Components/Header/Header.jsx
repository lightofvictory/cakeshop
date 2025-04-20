import React, { useEffect, useState } from 'react';
import { assets } from '../../assets/assets.js';

const Header = () => {
  const slides = [assets.cake1, assets.cake2, assets.cake3, assets.cake4, assets.cake5];

  const [randomSlides, setRandomSlides] = useState([]);

  
  const getRandomSlides = () => {
    const shuffled = slides.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2); 
  };

  useEffect(() => {
  
    setRandomSlides(getRandomSlides());

   
    const interval = setInterval(() => {
      setRandomSlides(getRandomSlides());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slideshow-container">
      <div className="photos-container" style={photosContainerStyle}>
        {randomSlides.map((slide, index) => (
          <div key={index} style={photoWrapperStyle}>
            <img src={slide} alt={`Slide ${index + 1}`} style={photoStyle} />
          </div>
        ))}
      </div>
    </div>
  );
};


const photosContainerStyle = {
  display: 'flex',
  flexWrap: 'nowrap', 
  gap: '16px',
  justifyContent: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  animation: 'slide 10s linear infinite',
};

const slideAnimation = `
@keyframes slide {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
`;

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(slideAnimation, styleSheet.cssRules.length);

const photoWrapperStyle = {
  marginTop :'20px',
  width: '600px',
  height: '240px', 
  overflow: 'hidden', 
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
};

const photoStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover', 
};

export default Header;
