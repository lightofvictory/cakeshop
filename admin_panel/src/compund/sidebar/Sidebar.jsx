import React from 'react'
import { assert } from '../../assets/assert'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {

const activeStyle = {
  backgroundColor: '#fff0ed',
  borderColor: 'tomato',
  color: 'tomato',
};

const inactiveStyle = {

  color: 'inherit',
};

const active = ({ isActive }) => (isActive ? activeStyle : inactiveStyle);



  return (
    <>
      <div className="w-1/4 h-screen ms-24 bg-gray-200 flex flex-col items-center gap-10 pt-2 md:w-1/4">
        <NavLink
          to='/add'
          className="w-full h-20 bg-gray-300 flex justify-center gap-5 items-center border-1 sm:h-16 " style={active}
        >
          <img
            className="w-10 h-10 sm:w-8 sm:h-8"
            src={assert.add_image}
            alt=""
          />
          <p className="text-sm sm:text-xs hidden sm:block">Add Items</p>
        </NavLink>

        <NavLink
          to='/list'
          className="w-full h-20 bg-gray-300 flex justify-center gap-5 items-center border-1 sm:h-16 " style={active}
        >
          <img
            className="w-10 h-10 sm:w-8 sm:h-8"
            src={assert.cardbox}
            alt=""
          />
          <p className="text-sm sm:text-xs hidden sm:block">List Items</p>
        </NavLink>

        <NavLink
          to='/order'
          className="w-full h-20 bg-gray-300 flex justify-center gap-5 items-center border-1 sm:h-16 " style={active}
        >
          <img className="w-10 h-10 sm:w-8 sm:h-8" src={assert.order} alt="" />
          <p className="text-sm sm:text-xs hidden sm:block">Order Items</p>
        </NavLink>
      </div>
    </>
  );
};

export default Sidebar;
