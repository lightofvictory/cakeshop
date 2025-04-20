import React from 'react'
import { assert } from '../../assets/assert'
const Navbar = () => {
  return (
    <>
      <div className='text-white w-full h-20 px-10 flex justify-between items-center'>
        <div>
     
        <img className='w-15 h-15' src={assert.Logo} alt="" />   
          <h3 className='text-black'>Admin Panel</h3>
          </div>
        <img className='w-12' src={assert.user_profile} alt="" />
      </div>
    </>
  )
}

export default Navbar
