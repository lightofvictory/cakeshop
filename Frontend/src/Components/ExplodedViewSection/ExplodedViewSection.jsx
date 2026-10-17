import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RightOutlined, StarOutlined } from '@ant-design/icons';
import { assets } from '../../assets/assets';
import './ExplodedViewSection.scss';

const flavorData = {
  chocolate: {
    id: 'chocolate',
    name: 'Belgian Chocolate Cake',
    tagline: 'Rich, Decadent & Multi-Layered Indulgence',
    badge: '🍫 MOST POPULAR FLAVOR',
    image: assets.explodedCake,
    accentColor: '#4a2c11',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
    layers: [
      { name: 'Chocolate Decoration', desc: 'Handcrafted chocolate curls & chips for a rich finish.' },
      { name: 'Chocolate Ganache', desc: 'Smooth, glossy Belgian ganache for a luxurious drip.' },
      { name: 'Chocolate Sponge', desc: 'Soft, moist & fluffy cocoa sponge cake.' },
      { name: 'Chocolate Cream', desc: 'Light & creamy whipped chocolate mousse.' },
      { name: 'Chocolate Filling', desc: 'Rich chocolate truffle filling for extra indulgence.' },
      { name: 'Cake Base', desc: 'Sturdy foundation base supporting every layer.' },
    ],
  },
  strawberry: {
    id: 'strawberry',
    name: 'Fresh Strawberry Cake',
    tagline: 'Fruity, Refreshing & Handcrafted Daily',
    badge: '🍓 CHEF’S SPECIAL FLAVOR',
    image: assets.explodedStrawberry,
    accentColor: '#be123c',
    badgeBg: '#ffe4e6',
    badgeColor: '#9f1239',
    layers: [
      { name: 'Strawberry Decoration', desc: 'Fresh farm strawberries & edible flower garnish.' },
      { name: 'Strawberry Glaze', desc: 'Shiny & flavorful fruit glaze top coating.' },
      { name: 'Vanilla Sponge', desc: 'Light, soft & airy vanilla chiffon sponge.' },
      { name: 'Strawberry Cream', desc: 'Whipped strawberry cream for a light fruity taste.' },
      { name: 'Strawberry Filling', desc: 'Juicy strawberry compote with real fruit pieces.' },
      { name: 'Cake Base', desc: 'Sturdy foundation base supporting every layer.' },
    ],
  },
};

const ExplodedViewSection = () => {
  const [activeFlavor, setActiveFlavor] = useState('chocolate');
  const [activeLayerIndex, setActiveLayerIndex] = useState(null);

  const flavor = flavorData[activeFlavor];

  return (
    <section className="exploded-view-section">
      <div className="exploded-container">
        {/* Section Header */}
        <div className="exploded-header-block">
          <span className="section-eyebrow">
            <StarOutlined style={{ marginRight: '6px' }} /> ANATOMY OF OUR CAKES
          </span>
          <h2 className="section-title">Inside Every Slice (Anatomy of Delight)</h2>
          <p className="section-subtitle">
            Explore the handcrafted layers behind our signature cakes, baked fresh with premium ingredients.
          </p>

          {/* Flavor Tabs Selector */}
          <div className="flavor-tabs-row">
            <button
              type="button"
              className={`flavor-tab-btn ${activeFlavor === 'chocolate' ? 'active chocolate' : ''}`}
              onClick={() => {
                setActiveFlavor('chocolate');
                setActiveLayerIndex(null);
              }}
            >
              🍫 Belgian Chocolate
            </button>
            <button
              type="button"
              className={`flavor-tab-btn ${activeFlavor === 'strawberry' ? 'active strawberry' : ''}`}
              onClick={() => {
                setActiveFlavor('strawberry');
                setActiveLayerIndex(null);
              }}
            >
              🍓 Fresh Strawberry
            </button>
          </div>
        </div>

        {/* Exploded Interactive Display */}
        <div className="exploded-content-grid">
          {/* Left / Center Diagram */}
          <div className="diagram-column animate-fade-in" key={flavor.id}>
            <div className="flavor-badge-tag" style={{ background: flavor.badgeBg, color: flavor.badgeColor }}>
              {flavor.badge}
            </div>
            <div className="diagram-image-wrapper">
              <img src={flavor.image} alt={`Exploded View ${flavor.name}`} />
            </div>
          </div>

          {/* Right Layer Breakdown Cards */}
          <div className="layers-column">
            <div className="flavor-title-group">
              <h3 className="flavor-main-name">{flavor.name}</h3>
              <p className="flavor-tagline">{flavor.tagline}</p>
            </div>

            <div className="layers-list">
              {flavor.layers.map((layer, idx) => (
                <div
                  key={idx}
                  className={`layer-card ${activeLayerIndex === idx ? 'active' : ''}`}
                  onMouseEnter={() => setActiveLayerIndex(idx)}
                  onMouseLeave={() => setActiveLayerIndex(null)}
                >
                  <div className="layer-step-badge">{idx + 1}</div>
                  <div className="layer-details">
                    <h4 className="layer-name">{layer.name}</h4>
                    <p className="layer-desc">{layer.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="exploded-action-bar">
              <Link to="/menu" className="order-custom-btn">
                Order Custom {flavor.name} <RightOutlined style={{ fontSize: '12px' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExplodedViewSection;
