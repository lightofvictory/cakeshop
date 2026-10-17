import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  WhatsAppOutlined,
  HomeOutlined,
  TeamOutlined,
  ShopOutlined,
  ArrowUpOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { assets } from '../../assets/assets';
import { useSettings } from '../../context/SettingsContext';
import './Footer.scss';

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const logoImg = settings?.logo
    ? settings.logo.startsWith('http')
      ? settings.logo
      : `http://localhost:3000/images/${settings.logo}`
    : assets.pastry;

  const rawPhone = settings?.phone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
  const rawWhatsapp = settings?.whatsappNumber || '9876543210';
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="footer-container">
      {/* Background ambient glows */}
      <div className="footer-decor-1"></div>
      <div className="footer-decor-2"></div>

      <div className="footer-content">
        {/* 1. Top Light Cream / Soft Pink Brand Banner Card */}
        <div className="footer-brand-banner">
          <div className="banner-cake-illustration">
            <img src={assets.cake4 || assets.pastry} alt="Bakery Pastry" />
          </div>

          <div className="banner-main">
            <div className="brand-header-pill">
              <img src={logoImg} alt="Logo" className="footer-logo" />
              <div className="brand-titles">
                <span className="brand-name">{settings?.shopName || 'MANO'}</span>
                <span className="brand-sub">{settings?.shopTagline || 'GOURMET BAKERY & CAFÉ'}</span>
              </div>
            </div>

            <p className="cursive-tag">Baked with Love ♡</p>

            <div className="social-row">
              <div className="social-icons">
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="social-btn whatsapp"
                >
                  <WhatsAppOutlined />
                </a>
                <a
                  href={settings?.instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="social-btn instagram"
                >
                  <InstagramOutlined />
                </a>
                <a
                  href={settings?.facebookUrl || settings?.youtubeUrl || 'https://youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="social-btn youtube"
                >
                  <YoutubeOutlined />
                </a>
              </div>
              <div className="follow-doodle">
                <span>Follow Us</span>
                <span className="arrow-doodle">↙</span>
              </div>
            </div>
          </div>

          <div className="banner-side-badge">
            <span>Sweet Moments Always ♡</span>
          </div>
        </div>

        {/* 2, 3, 4: Responsive Cards Grid for All Devices */}
        <div className="footer-cards-grid">
          {/* Explore Navigation Card */}
          <div className="footer-card footer-card-explore">
            <h3 className="card-title">
              EXPLORE
              <span className="title-bar"></span>
            </h3>
            <div className="explore-grid">
              <Link to="/" className="explore-item">
                <div className="icon-circle">
                  <HomeOutlined />
                </div>
                <span>Home</span>
              </Link>
              <Link to="/about" className="explore-item">
                <div className="icon-circle">
                  <TeamOutlined />
                </div>
                <span>About Us</span>
              </Link>
              <Link to="/menu" className="explore-item">
                <div className="icon-circle">
                  <ShopOutlined />
                </div>
                <span>Menu</span>
              </Link>
              <Link to="/contact" className="explore-item">
                <div className="icon-circle">
                  <MailOutlined />
                </div>
                <span>Contact Us</span>
              </Link>
            </div>
          </div>

          {/* Contact Us Card */}
          <div className="footer-card footer-card-contact">
            <h3 className="card-title">
              CONTACT US
              <span className="title-bar"></span>
            </h3>

            <div className="contact-body">
              <div className="contact-details">
                <div className="contact-item">
                  <div className="icon-bubble">
                    <EnvironmentOutlined />
                  </div>
                  <span>
                    {settings?.address || '123 Bakery Street, MG Road'}, {settings?.city || 'Mumbai'}{' '}
                    {settings?.pincode ? `(${settings.pincode})` : '(400001)'}
                  </span>
                </div>
                <div className="contact-item">
                  <div className="icon-bubble">
                    <PhoneOutlined />
                  </div>
                  <a href={`tel:${cleanPhone}`}>{rawPhone}</a>
                </div>
                <div className="contact-item">
                  <div className="icon-bubble">
                    <MailOutlined />
                  </div>
                  <a href={`mailto:${settings?.email || 'support@mrpastry.com'}`}>
                    {settings?.email || 'support@mrpastry.com'}
                  </a>
                </div>
              </div>

              <div className="contact-decor-sketch">
                <span className="cursive-quote">
                  Let's<br />Create<br />Sweeter<br />Memories
                </span>
              </div>
            </div>
          </div>

          {/* Stay In The Loop Card (Newsletter) */}
          <div className="footer-card footer-card-newsletter">
            <div className="newsletter-header">
              <div className="newsletter-icon">
                <MailOutlined />
              </div>
              <div className="newsletter-text">
                <h4>STAY IN THE LOOP</h4>
                <p>Get exclusive offers, new flavors & updates.</p>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="input-pill-wrap">
                <MailOutlined className="input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="subscribe-btn">
                  {subscribed ? 'Subscribed! ✨' : <>Subscribe <RightOutlined style={{ fontSize: '11px' }} /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 5. Footer Bottom Bar */}
      <div className="footer-bottom">
        <p className="copyright-text">
          &copy; {new Date().getFullYear()} {settings?.shopName || 'MANO'}. ALL RIGHTS RESERVED.
        </p>

        <div className="decorative-heart-line">
          <span className="line"></span>
          <span className="heart-icon">♡</span>
          <span className="line"></span>
        </div>

        <button onClick={scrollToTop} className="scroll-top-btn" title="Scroll to top" aria-label="Scroll to top">
          <ArrowUpOutlined />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
