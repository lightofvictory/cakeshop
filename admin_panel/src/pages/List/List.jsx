import React from 'react'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
const List = () => {
   const url="http://localhost:3000"
  const [list, setList] = useState([]);
  
  const fetchCakes= async()=>{  // fetch all  cakes
   const res= await axios.get(`${url}/api/cakes/list`);
console.log(res.data);
   if(res.data.success){
    setList(res.data.data);
   }
  else{
    toast.error(res.data.message)
  }
}

const removeCakeItem = async (id) => {
  try {
    const res = await axios.post(`${url}/api/cakes/remove`, { id });

    if (res.data.success) {
      toast.success(res.data.message);
      console.log(res.data.message);
      await fetchCakes(); // Refresh after deletion
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    console.error("Error deleting cake:", error);
    toast.error("Something went wrong while deleting the cake.");
  }
};

useEffect(()=>{
  fetchCakes()},[]);





  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-semibold mb-6 text-center">All Cake Items</h2>

      <div className="overflow-x-auto">
        <table className="w-full lg:w-3xl border border-gray-200 ">
          <thead className=" text-gray-700">
            <tr>
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No items found.</td>
              </tr>
            ) : (
              list.map((cake, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">
                    <img
                      src={`${url}/images/${cake.image}`}
                      alt={cake.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-5">{cake.name}</td>
                  <td className="p-5">{cake.category}</td>
                  <td className="p-5">₹{cake.price}</td>
                  <td className="p-5">{cake.description}</td>
                  <td onClick={()=>removeCakeItem(cake._id)} className='p-5 text-2xl cursor-pointer'>x</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;


