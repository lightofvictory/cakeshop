import React from "react";
import Header from "../../Components/Header/Header";
import { assets } from "../../assets/assets.js";

import About from "../About/About.jsx";
import Menu from "../Menu/Menu.jsx";

import Footer from "../footer/Fotter.jsx";

const Home = () => {
  return (
    <>
      <div>
        <Header />

        <div className="flex flex-col lg:flex-row justify-between items-center p-6 md:p-10 lg:p-14">
          {/* Left Side - Text Section */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center">
            <q className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-blue-700 bg-clip-text">
              Sweetest Slide Of Paradise, Topper with a Smile
            </q>

            <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-justify p-4 md:p-6">
              Welcome to <span className="text-pink-700 font-semibold">MR PASTRY Cake Shop</span>,
              Tirupattur's premier destination for delicious cakes and treats! We’re passionate 
              about creating mouthwatering masterpieces that delight your senses. We carefully 
              select our ingredients for their freshness, flavor, and natural value. We choose 
              organic, locally grown products when available.
            </p>
            <div className="flex justify-evenly w-full mt-4 text-2xl">
              {(() => {
                const [cakeCount, setCakeCount] = React.useState(0);
                const [varietyCount, setVarietyCount] = React.useState(0);

                React.useEffect(() => {
                  const cakeInterval = setInterval(() => {
                    setCakeCount((prevCount) => {
                      if (prevCount < 350) {
                        return prevCount + 1;
                      } else {
                        clearInterval(cakeInterval);
                        return prevCount;
                      }
                    });
                  }, 10);

                  const varietyInterval = setInterval(() => {
                    setVarietyCount((prevCount) => {
                      if (prevCount < 280) {
                        return prevCount + 1;
                      } else {
                        clearInterval(varietyInterval);
                        return prevCount;
                      }
                    });
                  }, 10);

                  return () => {
                    clearInterval(cakeInterval);
                    clearInterval(varietyInterval);
                  };
                }, []);

                return (
                  <>
                    <b>Cakes {cakeCount}+..</b>
                    <b> Variety {varietyCount}+..</b>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Right Side - Image Section */}
          <div className="w-full lg:w-1/2 flex justify-center mt-6 lg:mt-0">
            <img
              className="w-3/4 sm:w-2/3 md:w-1/2 lg:w-2/3 object-cover rounded-lg"
              src={assets.pastry}
              alt="Pastry Image"
            />
          </div>
        </div>
      </div>
   
      <About />
      <Menu/>
    <Footer/>
    </>
  );
};

export default Home;



