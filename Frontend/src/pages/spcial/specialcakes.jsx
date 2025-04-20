import React from 'react';
import 'tailwindcss/tailwind.css';
import splimage from '../../assets/Menu.png'
const specialCakes = [
    { occasion: 'New Year', cakes: ['New Year Cake 1', 'New Year Cake 2','New Year Cake 3', 'New Year Cake 4','New Year Cake 5', 'New Year Cake 6'] },
   
];

const SpecialCakes = () => {
    return (
        <div className="flex flex-col items-center">
            {specialCakes.map((item, index) => (
                <div 
                    key={index} 
                    className="special-cake border shadow-lg p-10 m-4 w-1/2 border-spacing-1 flex flex-col items-center"
                >
                    <h2 className="text-xl font-bold mb-2">Special Menu</h2>
                    <img src={splimage} alt="Special Cake" className="w-1/2 h-auto mb-4" />
                    {/*
                     this for without template to show the menu
                    <h2 className="text-xl font-bold mb-2">{item.occasion} Special Cakes</h2>
                    <ul className="list-disc pl-5">
                        {item.cakes.map((cake, idx) => (
                            <li key={idx} className="hover:bg-gray-200 cursor-pointer p-3">{cake}</li>
                        ))} 
                    </ul> */}
                </div>
            ))}
        </div>
    );
};

export default SpecialCakes;