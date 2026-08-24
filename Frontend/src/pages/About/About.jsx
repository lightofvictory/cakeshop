import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets.js';
import './About.scss';

const About = () => {
    return (
        <main className="about-page">
            <section className="about-hero">
                <p>About Mr. Pastry</p>
                <h1>Made with care.<br /><span>Remembered with joy.</span></h1>
                <div><Link to="/">Home</Link><span>/</span> About us</div>
            </section>
            <section className="about-container">
                <div className="about-decor-shape"></div>
                <div className="about-content">
                <div className="about-image-column">
                    <div className="about-image-backdrop"></div>
                    <img 
                        src={assets.cake2} 
                        alt="About Our Cake Shop" 
                        className="about-img" 
                    />
                </div>

                {/* Text Column */}
                <div className="about-text-column">
                    <span className="about-badge">
                        Our Story
                    </span>
                    <h2 className="about-title">
                        Baking With <br /> 
                        <span className="highlight-pink">Passion</span>
                    </h2>
                    <p className="about-desc-1">
                        Welcome to Mr. Pastry! We specialize in creating delicious, beautiful, and vibrant cakes for all occasions. Our team of skilled artisans uses only the finest, fresh ingredients to ensure that every creation is a sweet masterpiece.
                    </p>
                    <p className="about-desc-2">
                        Whether you're celebrating a birthday, wedding, or any special event, we have the perfect cake to make it memorable. Come visit us and taste the difference!
                    </p>
                    <div className="about-signature-wrapper">
                        <img 
                            src={assets.cakelogo} 
                            alt="Mr. Pastry Signature Logo" 
                            className="about-logo-signature" 
                        />
                    </div>
                </div>
                </div>
            </section>
            <section className="about-values">
                <div className="values-shell">
                    <div><span>01</span><h2>Fresh ingredients</h2><p>We start with quality ingredients, because a great cake should taste as good as it looks.</p></div>
                    <div><span>02</span><h2>Thoughtful craft</h2><p>Each cake is carefully finished by hand for a centrepiece made just for your occasion.</p></div>
                    <div><span>03</span><h2>Happy moments</h2><p>From small treats to large celebrations, we love being part of your sweetest memories.</p></div>
                </div>
            </section>
            <section className="about-cta">
                <p>Let&apos;s make something sweet</p>
                <h2>Have a celebration in mind?</h2>
                <Link to="/contact">Plan your cake</Link>
            </section>
        </main>
    );
};

export default About;
