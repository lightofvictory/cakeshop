/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const OrdersContext = createContext(null);

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('mr-pastry-orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  useEffect(() => localStorage.setItem('mr-pastry-orders', JSON.stringify(orders)), [orders]);
  const placeOrder = (orderData) => setOrders((currentOrders) => [
    { 
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
      paymentMethod: orderData.paymentMethod || 'cod'
    },
    ...currentOrders.map((order) => order.customerEmail === orderData.customerEmail && order.status === 'Preparing' ? { ...order, status: 'Delivered' } : order),
  ]);
  const getCustomerOrders = (customerEmail) => orders.filter((order) => order.customerEmail === customerEmail);
  const value = useMemo(() => ({ getCustomerOrders, placeOrder }), [orders]);
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};

export const useOrders = () => {
  const orders = useContext(OrdersContext);
  if (!orders) throw new Error('useOrders must be used within OrdersProvider');
  return orders;
};
