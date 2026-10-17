/**
  Unified Fulfillment Workflows & Status Configuration
  
  DELIVERY Flow:
  ORDER_PLACED -> CONFIRMED -> PREPARING -> READY_FOR_DISPATCH -> DRIVER_ASSIGNED -> PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED -> COMPLETED

  DINE_IN Flow:
  ORDER_PLACED -> CONFIRMED -> PREPARING -> READY -> SERVED -> BILL_REQUESTED -> PAYMENT_COMPLETED -> COMPLETED

  PICKUP Flow:
  ORDER_PLACED -> CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> CUSTOMER_ARRIVED -> PICKED_UP -> COMPLETED
 */

export const FULFILLMENT_TYPES = {
  DELIVERY: 'DELIVERY',
  DINE_IN: 'DINE_IN',
  PICKUP: 'PICKUP',
};

export const FULFILLMENT_FLOWS = {
  DELIVERY: [
    { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Order received by system', icon: '📝' },
    { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Bakery accepted your order', icon: '✅' },
    { key: 'PREPARING', label: 'Preparing', desc: 'Kitchen is crafting your cake', icon: '👨‍🍳' },
    { key: 'READY_FOR_DISPATCH', label: 'Ready for Dispatch', desc: 'Order packed & ready', icon: '📦' },
    { key: 'DRIVER_ASSIGNED', label: 'Driver Assigned', desc: 'Delivery partner assigned', icon: '🛵' },
    { key: 'PICKED_UP', label: 'Picked Up by Driver', desc: 'Driver collected from store', icon: '🛍️' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Driver is on the way to you', icon: '🚚' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over to customer', icon: '🎉' },
    { key: 'COMPLETED', label: 'Order Completed', desc: 'Enjoy your fresh treats!', icon: '✨' },
  ],

  DINE_IN: [
    { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Order placed from table', icon: '📝' },
    { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Kitchen accepted table order', icon: '✅' },
    { key: 'PREPARING', label: 'Preparing', desc: 'Freshly baking in kitchen', icon: '👨‍🍳' },
    { key: 'READY', label: 'Food Ready', desc: 'Plated & ready for table', icon: '🎂' },
    { key: 'SERVED', label: 'Served at Table', desc: 'Waiter served to your table', icon: '🍽️' },
    { key: 'BILL_REQUESTED', label: 'Bill Requested', desc: 'Receipt generated', icon: '🧾' },
    { key: 'PAYMENT_COMPLETED', label: 'Payment Successful', desc: 'Paid at table / counter', icon: '💳' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Thank you for dining with us!', icon: '✨' },
  ],

  PICKUP: [
    { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Pickup order registered', icon: '📝' },
    { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Store accepted pickup order', icon: '✅' },
    { key: 'PREPARING', label: 'Preparing', desc: 'Baking fresh for counter pickup', icon: '👨‍🍳' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', desc: 'Waiting at store counter', icon: '🎁' },
    { key: 'CUSTOMER_ARRIVED', label: 'Customer Arrived', desc: 'You arrived at store counter', icon: '📍' },
    { key: 'PICKED_UP', label: 'Order Collected', desc: 'Handed over to customer', icon: '🛍️' },
    { key: 'COMPLETED', label: 'Order Completed', desc: 'Enjoy your fresh treats!', icon: '✨' },
  ],
};

export const getFulfillmentFlowSteps = (orderType) => {
  const normalizedType = (orderType || '').toUpperCase().replace(/[\s-]/g, '_');
  if (normalizedType === 'DINE_IN' || normalizedType === 'DINEIN') {
    return FULFILLMENT_FLOWS.DINE_IN;
  }
  if (normalizedType === 'PICKUP' || normalizedType === 'PICK_UP') {
    return FULFILLMENT_FLOWS.PICKUP;
  }
  return FULFILLMENT_FLOWS.DELIVERY;
};

export const getStatusIndex = (flowSteps, status) => {
  if (!status) return 0;
  const upperStatus = status.toUpperCase();
  if (upperStatus === 'NEW') return 0;
  if (upperStatus === 'ACCEPTED') return 1;

  const idx = flowSteps.findIndex((step) => step.key === upperStatus);
  return idx >= 0 ? idx : 0;
};
