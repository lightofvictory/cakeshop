import React from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import "./Footer.scss";

const Footer = () => {
    return (
        <footer className="footer-container">
            {/* Decorative background shapes */}
            <div className="footer-decor-1"></div>
            <div className="footer-decor-2"></div>

            <div className="footer-content">
                
                {/* Logo & Info */}
                <div className="footer-brand">
                    <div className="brand-title">
                        Mr. Pastry
                    </div>
                    <p className="brand-desc">
                        Crafting the sweetest slices of modern paradise for your most memorable moments.
                    </p>
                    <div className="social-icons">
                        <img src={assets.whatsapp} alt="WhatsApp" />
                        <a href="https://www.instagram.com/mr.pastry7/" target="_blank" rel="noopener noreferrer">
                            <img src={assets.instagram} alt="Instagram" />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="footer-links">
                    <h4 className="links-title">Explore</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/menu">Menu</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="footer-contact">
                    <h4 className="contact-title">Contact</h4>
                    <div className="contact-details">
                        <p>Mr Pastry, Lakshmipati Hospital, Opposite Road, Ramakkapet, Tirupathur, Tamil Nadu 635601</p>
                        <p>Phone: 096292 12805</p>
                    </div>
                </div>

            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Mr. Pastry. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
