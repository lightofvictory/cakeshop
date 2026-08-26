/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const parsePrice = (price) => Number(String(price).replace(/[^0-9.]/g, '')) || 0;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('mr-pastry-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [orderPreference, setOrderPreference] = useState(() => {
    const saved = localStorage.getItem('mr-pastry-order-pref');
    const todayUtc = new Date().toISOString().split('T')[0];
    return saved ? JSON.parse(saved) : {
      mode: 'delivery', // 'delivery' | 'dinein' | 'pickup'
      tableNumber: 'Table #1',
      guestCount: 2,
      pickupBranch: 'Flagship Bakery - Downtown',
      utcDateStr: todayUtc,
      formattedDate: 'Today',
      formattedTime: 'ASAP (25 MINS)',
      dateType: 'Today',
      timeSlot: 'ASAP (25 MINS)',
      isConfigured: false
    };
  });

  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(() => {
    const saved = localStorage.getItem('mr-pastry-order-pref');
    return !saved;
  });

  const [savedAddresses, setSavedAddresses] = useState(() => {
    const saved = localStorage.getItem('mr-pastry-addresses');
    return saved ? JSON.parse(saved) : [
      {
        id: 'addr-1',
        title: 'Home',
        addressLine: '123 Baker Street, Suite 4B',
        state: 'California',
        country: 'United States',
        pincode: '90210',
        phone: '+1 (555) 234-5678',
        locationLink: 'https://maps.google.com/?q=123+Baker+Street',
        isDefault: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mr-pastry-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('mr-pastry-order-pref', JSON.stringify(orderPreference));
  }, [orderPreference]);

  useEffect(() => {
    localStorage.setItem('mr-pastry-addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  const addAddress = (newAddr) => {
    const addrObj = { ...newAddr, id: `addr-${Date.now()}` };
    setSavedAddresses(prev => [addrObj, ...prev]);
    return addrObj;
  };

  const removeAddress = (id) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  const updateOrderPreference = (newPref) => {
    setOrderPreference(prev => ({ ...prev, ...newPref, isConfigured: true }));
  };

  const openPreferenceModal = () => setIsPreferenceModalOpen(true);
  const closePreferenceModal = () => setIsPreferenceModalOpen(false);

  const addToCart = (cake) => {
    if (!orderPreference.isConfigured) {
      setIsPreferenceModalOpen(true);
    }
    const item = { ...cake, priceValue: parsePrice(cake.price) };
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((currentItem) => currentItem.id === item.id);
      return existingItem
        ? currentItems.map((currentItem) => currentItem.id === item.id ? { ...currentItem, quantity: currentItem.quantity + 1 } : currentItem)
        : [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, quantity) => setCartItems((items) => quantity < 1 ? items.filter((item) => item.id !== itemId) : items.map((item) => item.id === itemId ? { ...item, quantity } : item));
  const removeFromCart = (itemId) => setCartItems((items) => items.filter((item) => item.id !== itemId));
  const clearCart = () => setCartItems([]);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.priceValue * item.quantity, 0);
  
  // Dynamic Delivery Fee based on order mode
  const deliveryFee = orderPreference.mode === 'delivery' ? (subtotal > 0 ? 50 : 0) : 0;

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    subtotal,
    deliveryFee,
    orderPreference,
    updateOrderPreference,
    isPreferenceModalOpen,
    openPreferenceModal,
    closePreferenceModal,
    savedAddresses,
    addAddress,
    removeAddress
  }), [cartItems, itemCount, subtotal, deliveryFee, orderPreference, isPreferenceModalOpen, savedAddresses]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart must be used within CartProvider');
  return cart;
};
