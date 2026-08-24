import React from 'react';
import splimage from '../../assets/Menu.png';
import "./SpecialCakes.scss";

const specialCakes = [
    { occasion: 'New Year', cakes: ['New Year Cake 1', 'New Year Cake 2','New Year Cake 3', 'New Year Cake 4','New Year Cake 5', 'New Year Cake 6'] },
];

const SpecialCakes = () => {
    return (
        <div className="special-cakes-container">
            {specialCakes.map((item, index) => (
                <div 
                    key={index} 
                    className="special-cake-card"
                >
                    <div className="card-decor-gradient"></div>
                    <div className="special-image-wrapper">
                        <div className="image-backdrop-accent"></div>
                        <img src={splimage} alt="Special Cake" />
                    </div>
                    <div className="special-text-wrapper">
                        <span className="special-badge">
                            Featured
                        </span>
                        <h2 className="special-title">
                            Special Menu
                        </h2>
                        <p className="special-desc">
                            Check out our seasonal selections, carefully crafted to bring joy to your celebrations.
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SpecialCakes;