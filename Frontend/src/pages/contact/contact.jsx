import React from 'react';
import "./Contact.scss";

const Contact = () => {
    return (
        <main className="contact-page-container">
            {/* Background elements */}
            <div className="contact-decor-1"></div>
            <div className="contact-decor-2"></div>

            <div className="contact-content-wrapper">
                
                {/* Header */}
                <div className="contact-header">
                    <span className="contact-badge">
                        Get In Touch
                    </span>
                    <h2 className="contact-title">
                        Contact <span>Us</span>
                    </h2>
                </div>

                <div className="contact-card-box">
                    <div className="card-top-accent"></div>

                    {/* Contact Info */}
                    <div className="contact-info-panel">
                        <div className="info-block">
                            <h4 className="info-title">
                                <span className="bullet-pink"></span> Visit Us
                            </h4>
                            <p className="info-text">
                                Mr Pastry, Lakshmipati Hospital, Opposite Road, Ramakkapet, Tirupathur, Tamil Nadu 635601
                            </p>
                        </div>
                        <div className="info-block">
                            <h4 className="info-title">
                                <span className="bullet-peach"></span> Contact
                            </h4>
                            <p className="info-text">
                                hello@mypastry.com<br/>096292 12805
                            </p>
                        </div>
                        <div className="info-block">
                            <h4 className="info-title">
                                <span className="bullet-cyan"></span> Hours
                            </h4>
                            <p className="info-text">
                                Open 24 hours
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
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
