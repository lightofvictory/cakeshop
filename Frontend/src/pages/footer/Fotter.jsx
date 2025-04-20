import React from 'react';
import { assets } from '../../assets/assets';

const Footer = () => {
    return (
        <footer className="flex justify-between items-center p-6 bg-gray-800 text-white">
            <div className="flex items-center">
                <img src={assets.pastry} alt="Company Logo" className="h-20 mr-4 p-1" />
            </div>
            <div className="flex-grow">
                <ul className="flex justify-center space-x-8">
                    <li><a href="#home" className="hover:underline">Home</a></li>
                    <li><a href="#about" className="hover:underline">About</a></li>
                    <li><a href="#menu" className="hover:underline">Menu</a></li>
                    <li><a href="#contact" className="hover:underline">Contact Us</a></li>
                </ul>
            </div>
            <div className="flex items-center">
                <div className="flex items-center space-x-4 ">
                    <img src={assets.whatsapp} alt="WhatApp Logo" className="h-8 " />
                    <img src={assets.instagram} alt="Instagram Logo" className="h-8 " />
                </div>
                <div className="text-right ml-4">
                    <p>Email: example@example.com</p>
                    <p>Phone: (123) 456-7890</p>
                    <p>Address: 123 Main St, Anytown, USA</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
