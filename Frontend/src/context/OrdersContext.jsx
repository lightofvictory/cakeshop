/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const OrdersContext = createContext(null);

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('mr-pastry-orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  useEffect(() => localStorage.setItem('mr-pastry-orders', JSON.stringify(orders)), [orders]);

  const placeOrder = async (orderData) => {
    const newOrderObj = {
      id: orderData.id || `MP${Date.now().toString().slice(-6)}`,
      customerEmail: orderData.customerEmail,
      date: new Date().toISOString(),
      items: orderData.items || [],
      subtotal: orderData.subtotal || orderData.total || 0,
      tax: orderData.tax || 45,
      discount: orderData.discount || 100,
      tip: orderData.tip || 50,
      total: orderData.total || 0,
      status: 'Preparing',
      orderPreference: orderData.orderPreference,
      fulfillmentDetails: orderData.fulfillmentDetails,
      cakeMessage: orderData.cakeMessage,
      paymentMethod: orderData.paymentMethod || 'cod',
    };

    setOrders((currentOrders) => [newOrderObj, ...currentOrders]);

    // Send order to NestJS Backend API so Admin Panel receives it in real time
    try {
      const backendPayload = {
        customer: {
          name: orderData.fulfillmentDetails?.name || orderData.customerEmail?.split('@')[0] || 'Customer',
          phone: orderData.fulfillmentDetails?.phone || '+91 9876543210',
          email: orderData.customerEmail || '',
          address: orderData.fulfillmentDetails?.address || 'Local Customer Address',
          city: 'Local City',
          pincode: '400001',
        },
        items: (orderData.items || []).map((item) => ({
          name: item.name,
          price: parseInt(String(item.price).replace(/[^0-9]/g, '')) || 599,
          quantity: item.quantity || 1,
          image: item.image || '',
          customMessage: orderData.cakeMessage || '',
        })),
        orderType: orderData.fulfillmentDetails?.type === 'Pick Up' ? 'PICKUP' : orderData.fulfillmentDetails?.type === 'Dine In' ? 'DINE_IN' : 'DELIVERY',
        paymentMethod: orderData.paymentMethod || 'COD',
        total: orderData.total || 0,
        notes: orderData.cakeMessage || orderData.fulfillmentDetails?.specialInstructions || '',
      };

      await axios.post('http://localhost:3000/api/orders', backendPayload);
    } catch (err) {
      console.log('Error posting order to NestJS backend:', err.message);
    }
  };

  const getCustomerOrders = (customerEmail) => orders.filter((order) => order.customerEmail === customerEmail);
  const value = useMemo(() => ({ getCustomerOrders, placeOrder }), [orders]);
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};

export const useOrders = () => {
  const orders = useContext(OrdersContext);
  if (!orders) throw new Error('useOrders must be used within OrdersProvider');
  return orders;
};
