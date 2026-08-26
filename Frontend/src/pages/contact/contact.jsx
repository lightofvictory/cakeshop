import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import "./Contact.scss";

const Contact = () => {
    const { settings } = useSettings();

    return (
        <main className="contact-page-container">
            <div className="contact-decor-1"></div>
            <div className="contact-decor-2"></div>

            <div className="contact-content-wrapper">
                <div className="contact-header">
                    <span className="contact-badge">Get In Touch</span>
                    <h2 className="contact-title">
                        Contact <span>Us</span>
                    </h2>
                </div>

                <div className="contact-card-box">
                    <div className="card-top-accent"></div>

                    <div className="contact-info-panel">
                        <div className="info-block">
                            <h4 className="info-title">
                                <span className="bullet-pink"></span> Visit Us
                            </h4>
                            <p className="info-text">
                                {settings?.shopName || 'Mr Pastry'}, {settings?.address || '123 Bakery Street'}, {settings?.city || 'Mumbai'} {settings?.pincode ? `(${settings.pincode})` : ''}
                            </p>
                        </div>
                        <div className="info-block">
                            <h4 className="info-title">
                                <span className="bullet-peach"></span> Contact & Phone
                            </h4>
                            <p className="info-text">
                                ✉️ {settings?.email || 'support@mrpastry.com'}<br/>
                                📞 {settings?.phone || '+919876543210'}
                            </p>
                        </div>
                        <div className="info-block">
                            <h4 className="info-title">
                                <span className="bullet-cyan"></span> Bakery Hours
                            </h4>
                            <p className="info-text">
                                {settings?.openTime || '08:00 AM'} - {settings?.closeTime || '10:00 PM'}
                                <br />
                                <span style={{ color: settings?.storeOpen ? '#10b981' : '#f43f5e', fontWeight: 700 }}>
                                    {settings?.storeOpen ? '🟢 Accepting Orders Online' : '🔴 Currently Closed'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="contact-form-panel">
                        <form className="contact-form">
                            <div className="form-grid-2">
                                <input 
                                    type="text" 
                                    placeholder="Your Name" 
                                    className="input-name"
                                />
                                <input 
                                    type="email" 
                                    placeholder="Your Email" 
                                    className="input-email"
                                />
                            </div>
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    placeholder="Subject" 
                                    className="input-subject"
                                />
                            </div>
                            <div className="form-group">
                                <textarea 
                                    placeholder="Your Message" 
                                    rows="4"
                                    className="input-message"
                                ></textarea>
                            </div>
                            <button 
                                type="button"
                                className="btn-submit"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Contact;
