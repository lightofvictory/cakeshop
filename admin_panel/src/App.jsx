import React from 'react'
import Navbar from './compund/Navbar/Navbar';
import Sidebar from './compund/sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Order from './pages/Order/Order';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    
<>
<ToastContainer />
<Navbar/>
<hr style={{ height: '2px' }} />
<div className=" flex">
<Sidebar/>
<div >
      <Routes>
        <Route path="/add" element={<Add />} />
        <Route path="/list" element={<List />} />
        <Route path="/order" element={<Order />} />
      </Routes>
  
</div>
</div>
    </>
  )
}

export default App;