import React, { useState } from 'react';
import axios from 'axios';
import { assert } from '../../assets/assert';
import { toast } from 'react-toastify';

const Add = () => {
  const [Image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Select',
    image: null
  });

  const onHandleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('image', formData.image);

    try {
      const res = await axios.post("http://localhost:3000/api/cakes/addcake", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
     toast.success(res.data.message);
    
          
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: null
    });
    setImage(null); 

    document.querySelector('input[type="file"]').value = null;

    } catch (error) {
     
  toast.error(error.data.message);
    }
  };

  return   (
    <div className='flex  min-h-screen p-10'>
      <form 
        onSubmit={onSubmitHandler} 
        className=' rounded-lg p-6 w-full  md:w-2xl  xl:w-3xl space-y-6'
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">Add a New Cake</h2>

        {/* Image Upload */}
        <div>
          <label htmlFor="file" className="block text-gray-600 font-medium">Upload Image</label>
          <div className="flex justify-center my-4">
            <img
              src={formData.image ? URL.createObjectURL(formData.image) : assert.upload_image}
              alt="preview"
              className='w-32 h-32 object-cover rounded-md border border-gray-300'
            />
          </div>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={onHandleChange}
            required
            className='block w-full text-gray-700 p-2 border-2 border-gray-300 rounded-md'
          />
        </div>

        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-gray-600 font-medium">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onHandleChange}
            placeholder="Product Name"
            required
            className='w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {/* Product Description */}
        <div>
          <label htmlFor="description" className="block text-gray-600 font-medium">Product Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onHandleChange}
            placeholder="Product Description"
            required
            rows={4}
            className='w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {/* Category and Price */}
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-gray-600 font-medium">Product Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={onHandleChange}
              required
              className='w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value="Select">Select Items</option>
              <option value="Deserts Item">Deserts Item</option>
              <option value="Salad Item">Salad Item</option>
              <option value="Cake Item">Cake Item</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta Item">Pasta Item</option>
              <option value="Snakes Item">Snakes Item</option>
              <option value="Cookies Item">Cookies Item</option>
              <option value="Sweet Items">Sweet Items</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-gray-600 font-medium">Product Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={onHandleChange}
              placeholder="Product Price"
              required
              className='w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className='w-full bg-blue-500 text-white p-3 rounded-md mt-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          Add Cake
        </button>
      </form>
    </div>
  );
};


export default Add;
