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
    const rawOrderType = (
      orderData.fulfillmentDetails?.type ||
      orderData.orderPreference?.mode ||
      'DELIVERY'
    ).toUpperCase().replace(/[\s-]/g, '_');

    let normalizedOrderType = 'DELIVERY';
    if (rawOrderType.includes('DINE')) normalizedOrderType = 'DINE_IN';
    if (rawOrderType.includes('PICK')) normalizedOrderType = 'PICKUP';

    const tableNum = orderData.fulfillmentDetails?.tableNumber || orderData.orderPreference?.tableNumber || 'Table #1';
    const guests = orderData.fulfillmentDetails?.guestCount || orderData.orderPreference?.guestCount || 2;
    const branch = orderData.fulfillmentDetails?.pickupBranch || orderData.orderPreference?.pickupBranch || 'Flagship Bakery - Downtown';
    const dateVal = orderData.orderPreference?.dateType || orderData.orderPreference?.formattedDate || 'Today';
    const timeVal = orderData.orderPreference?.timeSlot || orderData.orderPreference?.formattedTime || '10:00 AM - 12:00 PM';
    const updateChan = orderData.orderPreference?.orderUpdateChannel || 'WHATSAPP_SMS';
    const recChan = orderData.orderPreference?.receiptChannel || 'WHATSAPP';

    const initialStatus = 'ORDER_PLACED';
    const initialLog = [{ status: initialStatus, timestamp: new Date().toISOString(), note: 'Order placed' }];

    const newOrderObj = {
      id: orderData.id || `MP${Date.now().toString().slice(-6)}`,
      customerEmail: orderData.customerEmail,
      date: new Date().toISOString(),
      items: orderData.items || [],
      subtotal: orderData.subtotal || orderData.total || 0,
      tax: orderData.tax || 45,
      discount: orderData.discount || 0,
      tip: orderData.tip || 0,
      total: orderData.total || 0,
      status: initialStatus,
      statusHistory: initialLog,
      orderType: normalizedOrderType,
      tableNumber: tableNum,
      guestCount: guests,
      pickupBranch: branch,
      pickupDate: dateVal,
      pickupTime: timeVal,
      orderUpdateChannel: updateChan,
      receiptChannel: recChan,
      orderPreference: orderData.orderPreference,
      fulfillmentDetails: orderData.fulfillmentDetails,
      cakeMessage: orderData.cakeMessage,
      paymentMethod: orderData.paymentMethod || 'cod',
    };

    setOrders((currentOrders) => [newOrderObj, ...currentOrders]);

    // Send order to NestJS Backend API so Admin Panel receives it in real time
    try {
      const customerName = orderData.customerName || orderData.fulfillmentDetails?.name || (orderData.customerEmail ? orderData.customerEmail.split('@')[0] : 'Customer');
      const customerPhone = orderData.fulfillmentDetails?.phone || '+91 9876543210';
      const customerAddress = orderData.fulfillmentDetails?.address || 'Store / Local Pickup';

      const formattedItems = (orderData.items || []).map((item) => {
        let itemPrice = 599;
        if (typeof item.priceValue === 'number' && !isNaN(item.priceValue) && item.priceValue > 0) {
          itemPrice = item.priceValue;
        } else if (typeof item.price === 'number' && !isNaN(item.price) && item.price > 0) {
          itemPrice = item.price;
        } else if (item.price) {
          const parsed = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed) && parsed > 0) itemPrice = parsed;
        }

        return {
          name: item.name || 'Pastry Item',
          price: Math.round(itemPrice),
          quantity: item.quantity || 1,
          image: item.image || '',
          customMessage: orderData.cakeMessage || item.customMessage || '',
        };
      });

      const backendPayload = {
        customer: {
          name: customerName,
          phone: customerPhone,
          email: orderData.customerEmail || 'customer@mrpastry.com',
          address: customerAddress,
          city: 'Local City',
          pincode: '400001',
        },
        items: formattedItems,
        orderSource: orderData.orderSource || 'ECOMMERCE',
        fulfillmentType: normalizedOrderType,
        orderType: normalizedOrderType,
        tableNumber: tableNum,
        guestCount: guests,
        pickupBranch: branch,
        pickupDate: dateVal,
        pickupTime: timeVal,
        orderUpdateChannel: updateChan,
        receiptChannel: recChan,
        paymentMethod: (orderData.paymentMethod || 'COD').toUpperCase(),
        total: Math.round(orderData.total || 0),
        notes: orderData.cakeMessage || orderData.fulfillmentDetails?.specialInstructions || '',
      };

      const res = await axios.post('http://localhost:3000/api/orders', backendPayload);
      console.log('Order successfully sent to NestJS backend:', res.data);
    } catch (err) {
      console.error('Error posting order to NestJS backend:', err.response?.data || err.message);
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
