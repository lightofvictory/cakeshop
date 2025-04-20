import React from 'react';
import { motion } from "motion/react"
const About = () => {
    return (
        <>
       <motion.div />
     
        <div className="flex flex-col md:flex-row justify-around items-center p-20 border border-gray-200 rounded-lg shadow-lg bg-white lg:mx-20 my-10">
            <h1 className="text-4xl font-bold mb-4">About Our Cake Shop</h1>
            <p className="text-lg max-w-prose text-center md:text-justify">
                Welcome to our cake shop! We specialize in creating delicious and beautiful cakes for all occasions. Our team of skilled bakers uses only the finest ingredients to ensure that every cake is a masterpiece. Whether you're celebrating a birthday, wedding, or any special event, we have the perfect cake for you. Come visit us and taste the difference!
            </p>
        </div>
        </>
    );
};

export default About;