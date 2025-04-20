import React, { useState } from "react";

import '../../App.css';
const Navbar = () => {
  
     const [activeMenu ,setActiveMenu] = useState("Home");
  return (
    
    <>
      <div className="navbar flex justify-evenly items-center bg-slate-500 px-5 py-3 ">
        <div className=" text-2xl ">
          My Pastry
        </div>
        <div >
          <ul className="flex gap-5 justify-evenly text-blue-100 cursor-pointer ">
            <li onClick={()=>setActiveMenu("Home")} className={activeMenu==="Home"?"active":""} >Home</li>
            <li onClick={()=>setActiveMenu("About")} className={activeMenu==="About"?"active":""} >About Us</li>
            <li onClick={()=>setActiveMenu("Menu")} className={activeMenu==="Menu"?"active":""} >Menu</li> 
            <li onClick={()=>setActiveMenu("Contact")} className={activeMenu==="Contact"?"active":""} >Contact Us</li>
          </ul>
        </div>
      </div>

    </>
  );
};

export default Navbar;
