import React from 'react';
import SpecialCakes from '../spcial/specialcakes';
import { cakeImages } from '../../assets/cakeimages/Menus_Image.js';

const Menu = () => {
    const [counts, setCounts] = React.useState({});

    const handleIncrement = (item) => {
        setCounts((prevCounts) => ({
            ...prevCounts,
            [item]: (prevCounts[item] || 0) + 1,
        }));
    };

    const handleDecrement = (item) => {
        setCounts((prevCounts) => ({
            ...prevCounts,
            [item]: (prevCounts[item] || 0) > 0 ? prevCounts[item] - 1 : 0,
        }));
    };

    return (
        <>
            <div className='flex flex-col justify-items-center items-center'>
                <SpecialCakes />
                <h1 className="text-4xl font-bold mb-4 text-center">Menu</h1>
                {Object.keys(cakeImages).map((category) => (
                    <div key={category} style={{ marginBottom: '20px' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '1.5em' }}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </h2>
                        <div
                            style={{
                                display: 'flex',
                                overflowX: 'auto',
                                padding: '10px',
                                border: '1px solid black',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {cakeImages[category].map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'inline-block',
                                        textAlign: 'center',
                                        margin: '0 10px',
                                        padding: '5px',
                                        border: '1px solid black',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '6px',
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{ width: '150px', height: '100px', borderRadius: '6px' }}
                                    />
                                    <div className='flex flex-col items-center '>
                                    <div>{item.name}</div>
                                    <div className='flex w-32 p-4'>

                                    <div className='border border-spacing-21 w-40 bg-green-400 rounded-lg'>{item.price}</div>
                                    {/* <button className='bg-slate-400 border border-spacing-2 p-1  rounded-full' onClick={() => handleIncrement(item.name)}>+</button>
                                    <span  className='bg-pink-300 w-20'>{counts[item.name] || 0}</span>
                                    <button className='bg-slate-400 border border-spacing-2 p-1  rounded-full align-middle' onClick={() => handleDecrement(item.name)}>-</button> */}
                                </div>
                                </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Menu;