import React from 'react';
import Navbar from './components/Navbar/Navbar';
import './App.css'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';



const App = () => {
  return (
    <>
      <Navbar />
      <div className='min-h-screen' style={{background: 'linear-gradient(to right, lightblue, white, pink)' }}>
        {/* Routes */}
        <Routes>
          <Route path='/' element={<Home />} />
         
     
        </Routes>
      </div>
    </>
  )
}

export default App;
