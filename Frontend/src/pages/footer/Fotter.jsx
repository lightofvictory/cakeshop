import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { YoutubeOutlined } from '@ant-design/icons';
import { useSettings } from '../../context/SettingsContext';
import "./Footer.scss";

const Footer = () => {
    const { settings } = useSettings();
    const logoImg = settings?.logo ? `http://localhost:3000/images/${settings.logo}` : assets.pastry;

    return (
        <footer className="footer-container">
            <div className="footer-decor-1"></div>
            <div className="footer-decor-2"></div>

            <div className="footer-content">
                <div className="footer-brand">
                    <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={logoImg} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span>{settings?.shopName || 'Mr. Pastry'}</span>
                    </div>
                    <p className="brand-desc">
                        {settings?.heroSubtitle || 'Crafting the sweetest slices of modern paradise for your most memorable moments.'}
                    </p>
                    <div className="social-icons">
                        {settings?.whatsappNumber && (
                            <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                                <img src={assets.whatsapp} alt="WhatsApp" />
                            </a>
                        )}
                        {settings?.instagramUrl && (
                            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <img src={assets.instagram} alt="Instagram" />
                            </a>
                        )}
                        {settings?.facebookUrl && (
                            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <YoutubeOutlined className="youtube-icon" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="footer-links">
                    <h3 className="links-title">Explore</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/menu">Menu</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                </div>

                <div className="footer-contact">
                    <h3 className="contact-title">Contact Us</h3>
                    <div className="contact-details">
                        <p>📍 {settings?.address || '123 Bakery Street'}, {settings?.city || 'Mumbai'} {settings?.pincode ? `(${settings.pincode})` : ''}</p>
                        <p>📞 Phone: {settings?.phone || '+919876543210'}</p>
                        {settings?.email && <p>✉️ Email: {settings.email}</p>}
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} {settings?.shopName || 'Mr. Pastry'}. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
