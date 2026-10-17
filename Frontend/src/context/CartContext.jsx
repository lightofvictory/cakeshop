/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const parsePrice = (price) => Number(String(price).replace(/[^0-9.]/g, '')) || 0;

export const CartProvider = ({ children }) => {
  const { user, requireAuth } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('mr-pastry-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [orderPreference, setOrderPreference] = useState(() => {
    const saved = localStorage.getItem('mr-pastry-order-pref');
    const todayUtc = new Date().toISOString().split('T')[0];
    const initial = saved ? JSON.parse(saved) : {};
    
    // Check if logged-in user profile has saved preferences
    const hasUserProfilePref = Boolean(user && (user.isPreferenceConfigured || user.receiptChannel || user.preferredFulfillment));
    const userMode = user?.preferredFulfillment || initial.mode || 'delivery';
    const userUpdateChannel = user?.orderUpdateChannel || initial.orderUpdateChannel || 'WHATSAPP_SMS';
    const userReceipt = user?.receiptChannel || user?.receiveReceiptType || initial.receiptChannel || 'GMAIL_EMAIL';

    return {
      mode: userMode,
      tableNumber: initial.tableNumber || '',
      guestCount: initial.guestCount || '',
      pickupBranch: initial.pickupBranch || 'Flagship Bakery - Downtown',
      utcDateStr: initial.utcDateStr || todayUtc,
      formattedDate: initial.formattedDate || 'Today',
      formattedTime: initial.formattedTime || 'ASAP (25 MINS)',
      dateType: initial.dateType || 'Today',
      timeSlot: initial.timeSlot || 'ASAP (25 MINS)',
      orderUpdateChannel: userUpdateChannel,
      receiptChannel: userReceipt,
      isConfigured: hasUserProfilePref ? true : Boolean(initial.isConfigured)
    };
  });

  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);

  const [outlets, setOutlets] = useState([]);

  // Auto-detect Table QR Code Scan parameters (e.g. ?table=12 or ?mode=dinein&table=12)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table') || params.get('tableno') || params.get('tableNumber');
      const modeParam = params.get('mode');

      if (tableParam || modeParam === 'dinein') {
        const rawTable = tableParam ? tableParam.trim() : '';
        const formattedTable = rawTable ? (rawTable.toLowerCase().startsWith('table') ? rawTable : `Table #${rawTable}`) : '';

        setOrderPreference(prev => ({
          ...prev,
          mode: 'dinein',
          tableNumber: formattedTable || prev.tableNumber || '',
          isConfigured: true,
        }));
      }
    } catch (e) {
      console.error('Failed to parse QR code URL params:', e);
    }
  }, []);

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/settings');
        const data = await res.json();
        if (data && data.success && data.data) {
          const list = data.data.outlets || (data.data.shopSettings && data.data.shopSettings.outlets) || [];
          setOutlets(list);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchOutlets();
  }, []);

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

  // Auto-sync orderPreference whenever user logs in or profile preferences update
  useEffect(() => {
    if (user && (user.isPreferenceConfigured || user.receiptChannel || user.preferredFulfillment || user.orderUpdateChannel)) {
      setOrderPreference(prev => ({
        ...prev,
        mode: user.preferredFulfillment || prev.mode || 'delivery',
        orderUpdateChannel: user.orderUpdateChannel || prev.orderUpdateChannel || 'WHATSAPP_SMS',
        receiptChannel: user.receiptChannel || user.receiveReceiptType || prev.receiptChannel || 'GMAIL_EMAIL',
        isConfigured: true,
      }));
    }
  }, [user]);

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
    const isDineIn = orderPreference?.mode === 'dinein';
    if (!isDineIn && requireAuth && !requireAuth()) return;
    
    // Check if user profile already has saved preferences - if yes, no need to ask modal
    const isProfileConfigured = user && (user.isPreferenceConfigured || user.receiptChannel || user.preferredFulfillment);
    if (!orderPreference.isConfigured && !isProfileConfigured && !isDineIn) {
      setIsPreferenceModalOpen(true);
    }
    const itemId = cake.id || cake._id || cake.name;
    const priceVal = typeof cake.priceValue === 'number' && !isNaN(cake.priceValue) && cake.priceValue > 0
      ? cake.priceValue
      : parsePrice(cake.price);

    const item = { ...cake, id: itemId, priceValue: priceVal };
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
    removeAddress,
    outlets
  }), [cartItems, itemCount, subtotal, deliveryFee, orderPreference, isPreferenceModalOpen, savedAddresses, outlets]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart must be used within CartProvider');
  return cart;
};
