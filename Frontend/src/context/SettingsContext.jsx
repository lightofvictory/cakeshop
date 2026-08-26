import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    shopName: 'Mr. Pastry',
    tagline: 'Bakery Management & Inventory System',
    logo: '',
    bannerImage: '',
    heroTitle: 'The Best Cakes For Every Celebration',
    heroSubtitle: 'Beautifully made cakes, pastries, and sweet moments from the Mr. Pastry kitchen.',
    phone: '+919876543210',
    email: 'support@mrpastry.com',
    address: '123 Bakery Street, MG Road',
    city: 'Mumbai',
    pincode: '400001',
    instagramUrl: 'https://instagram.com/mrpastry',
    facebookUrl: 'https://facebook.com/mrpastry',
    whatsappNumber: '+919876543210',
    twitterUrl: 'https://twitter.com/mrpastry',
    currency: '₹',
    storeOpen: true,
    openTime: '08:00',
    closeTime: '22:00',
    deliveryFee: 40,
    freeDeliveryThreshold: 999,
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/settings');
      if (res.data && res.data.success && res.data.data) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error('Failed to fetch shop settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
