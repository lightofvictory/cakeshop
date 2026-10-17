import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    shopName: 'Mr. Pastry',
    shopDescription: '',
    tagline: 'Bakery Management & Inventory System',
    logo: '',
    bannerImage: '',
    heroTitle: 'The Best Cakes For Every Celebration',
    heroSubtitle: 'Beautifully made cakes, pastries, and sweet moments from the Mr. Pastry kitchen.',
    heroCtaText: 'Explore Cakes',
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
    showHero: true,
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/settings');
      if (res.data && res.data.success && res.data.data) {
        const d = res.data.data;
        const banners =
          d.homeSettings && Array.isArray(d.homeSettings.heroBanners) && d.homeSettings.heroBanners.length > 0
            ? d.homeSettings.heroBanners
            : Array.isArray(d.heroBanners) && d.heroBanners.length > 0
            ? d.heroBanners
            : [];
        const flattened = {
          ...d,
          ...(d.shopSettings || {}),
          ...(d.homeSettings || {}),
          ...(d.menuSettings || {}),
          shopDescription: d.shopDescription || (d.shopSettings && d.shopSettings.shopDescription) || d.shopSettings?.shopDescription || '',
          heroBanners: banners,
        };
        setSettings(flattened);
      }
    } catch (err) {
      console.error('Failed to fetch shop settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings once on mount + listen for cross-tab updates from Admin Panel
  useEffect(() => {
    fetchSettings();

    // Cross-tab broadcast listener for instant updates when Admin modifies settings
    let channel;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('mrpastry_settings_channel');
      channel.onmessage = (event) => {
        if (event.data === 'SETTINGS_UPDATED') {
          fetchSettings();
        }
      };
    }

    const handleStorageChange = (e) => {
      if (e.key === 'mrpastry_settings_updated') {
        fetchSettings();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (settings.shopName) {
      document.title = settings.shopName;
    }
    if (settings.logo) {
      const logoUrl = `http://localhost:3000/images/${settings.logo}`;
      let favicon = document.querySelector("link[rel*='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(favicon);
      }
      favicon.href = logoUrl;
    }

    // Dynamic Admin Theme Color Configuration
    const primary = settings.primaryColor || '#f43f5e';
    const primaryHover = settings.primaryHoverColor || '#be123c';
    const bgStart = settings.footerBgStart || '#1f0b15';
    const bgEnd = settings.footerBgEnd || '#120409';

    const root = document.documentElement;
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-hover', primaryHover);
    root.style.setProperty('--footer-bg-start', bgStart);
    root.style.setProperty('--footer-bg-end', bgEnd);
    root.style.setProperty(
      '--footer-gradient',
      `radial-gradient(circle at 85% 15%, ${primary}38 0%, transparent 45%), radial-gradient(circle at 15% 85%, ${primaryHover}33 0%, transparent 40%), linear-gradient(145deg, ${bgStart} 0%, ${bgEnd} 100%)`
    );
    root.style.setProperty(
      '--header-gradient',
      `radial-gradient(circle at 85% 15%, ${primary}38 0%, transparent 45%), radial-gradient(circle at 15% 85%, ${primaryHover}33 0%, transparent 40%), linear-gradient(145deg, ${bgStart} 0%, ${bgEnd} 100%)`
    );
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
