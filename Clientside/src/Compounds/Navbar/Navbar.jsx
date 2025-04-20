import React from "react";
import { assets } from "../../assert/assets.js";

const Navbar = () => {
  return (
    <>
      <div className="flex flex-row justify-between items-center shadow-md p-4">
        <div>
          <img src={assets.pastry} width={"70px"} height={"70px"} />
          </div>
       
        <div className="flex flex-row justify-between items-center w-full">
          <ul className="flex flex-row">
            <li>Home</li>
            <li>Menu</li>
            <li>Mobile-app</li>
            <li>Contact us</li>
          </ul>
        </div>

        <div className="flex flex-row">
          <img src={assets.search_icon} width={"40px"} height={"40px"} />
          <img
            src={assets.addcart_icon}
            alt=""
            width={"40px"}
            height={"40px"}
          />
          <div className="dot"></div>

          <button width={"20px"} height={"20px"}>
            Sign in
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
