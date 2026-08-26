import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Form, Input, InputNumber, Switch, Button, Row, Col, Upload, Tabs, Divider, Select, Space } from 'antd';
import {
  SettingOutlined,
  ShopOutlined,
  HomeOutlined,
  AppstoreOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CarOutlined,
  SaveOutlined,
  UploadOutlined,
  InstagramOutlined,
  FacebookOutlined,
  WhatsAppOutlined,
  TwitterOutlined,
  PictureOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

const Settings = () => {
  const url = 'http://localhost:3000';
  const [searchParams, setSearchParams] = useSearchParams();
  const [shopForm] = Form.useForm();
  const [homeForm] = Form.useForm();
  const [menuForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'shop');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // File states for uploads
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [promoFile, setPromoFile] = useState(null);
  const [promoPreview, setPromoPreview] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${url}/api/settings`);
      if (res.data && res.data.success && res.data.data) {
        const d = res.data.data;
        shopForm.setFieldsValue(d);
        homeForm.setFieldsValue(d);
        menuForm.setFieldsValue(d);

        if (d.logo) setLogoPreview(`${url}/images/${d.logo}`);
        if (d.bannerImage) setBannerPreview(`${url}/images/${d.bannerImage}`);
        if (d.promoBannerImage) setPromoPreview(`${url}/images/${d.promoBannerImage}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = (file) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    return false;
  };

  const handleBannerSelect = (file) => {
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    return false;
  };

  const handlePromoSelect = (file) => {
    setPromoFile(file);
    setPromoPreview(URL.createObjectURL(file));
    return false;
  };

  const handleSaveAll = async (values) => {
    setSaveLoading(true);
    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null) {
        formData.append(key, values[key]);
      }
    });

    if (logoFile) formData.append('logo', logoFile);
    if (bannerFile) formData.append('bannerImage', bannerFile);
    if (promoFile) formData.append('promoBannerImage', promoFile);

    try {
      const res = await axios.post(`${url}/api/settings`, formData);
      if (res.data && res.data.success) {
        toast.success('🎉 Settings updated and synced live to Frontend!');
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const tabItems = [
    {
      key: 'shop',
      label: (
        <span style={{ fontWeight: 800, fontSize: '14px' }}>
          <ShopOutlined /> Shop Settings
        </span>
      ),
      children: (
        <Form form={shopForm} layout="vertical" onFinish={handleSaveAll}>
          <Row gutter={[32, 24]}>
            {/* Left Column: Logo & Contact */}
            <Col xs={24} md={12}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <ShopOutlined style={{ color: '#f43f5e', marginRight: '8px' }} /> Store Logo & Identity
              </h3>

              <Form.Item label={<span style={{ fontWeight: 800 }}>Shop Logo Image</span>}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                      <ShopOutlined style={{ fontSize: '24px' }} />
                    </div>
                  )}

                  <Upload beforeUpload={handleLogoSelect} showUploadList={false} accept="image/*">
                    <Button icon={<UploadOutlined />} style={{ borderRadius: '8px', fontWeight: 700 }}>
                      Upload Shop Logo
                    </Button>
                  </Upload>
                </div>
              </Form.Item>

              <Form.Item name="shopName" label={<span style={{ fontWeight: 800 }}>Bakery Shop Name *</span>}>
                <Input size="large" prefix={<ShopOutlined />} style={{ borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item name="tagline" label={<span style={{ fontWeight: 800 }}>Tagline / Subtitle</span>}>
                <Input size="large" style={{ borderRadius: '10px' }} />
              </Form.Item>

              <Divider style={{ margin: '16px 0' }} />

              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <EnvironmentOutlined style={{ color: '#3b82f6', marginRight: '8px' }} /> Location & Support Contact
              </h3>

              <Form.Item name="address" label={<span style={{ fontWeight: 800 }}>Street Address *</span>}>
                <Input size="large" prefix={<EnvironmentOutlined />} placeholder="e.g. 123 Bakery Lane, MG Road" style={{ borderRadius: '10px' }} />
              </Form.Item>

              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item name="city" label={<span style={{ fontWeight: 800 }}>City *</span>}>
                    <Input size="large" placeholder="e.g. Mumbai" style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>

                <Col xs={12}>
                  <Form.Item name="pincode" label={<span style={{ fontWeight: 800 }}>Pincode *</span>}>
                    <Input size="large" placeholder="e.g. 400001" style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item name="phone" label={<span style={{ fontWeight: 800 }}>Contact Phone *</span>}>
                    <Input size="large" prefix={<PhoneOutlined />} style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>

                <Col xs={12}>
                  <Form.Item name="email" label={<span style={{ fontWeight: 800 }}>Support Email *</span>}>
                    <Input size="large" prefix={<MailOutlined />} style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Right Column: Operating Hours, Delivery & Social Links */}
            <Col xs={24} md={12}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <ClockCircleOutlined style={{ color: '#9333ea', marginRight: '8px' }} /> Store Operating Hours
              </h3>

              <Form.Item name="storeOpen" valuePropName="checked" label={<span style={{ fontWeight: 800 }}>Store Operating Status</span>}>
                <Switch checkedChildren="🟢 Store Open" unCheckedChildren="🔴 Store Closed" />
              </Form.Item>

              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item name="openTime" label={<span style={{ fontWeight: 800 }}>Opening Time</span>}>
                    <Input size="large" placeholder="08:00" style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item name="closeTime" label={<span style={{ fontWeight: 800 }}>Closing Time</span>}>
                    <Input size="large" placeholder="22:00" style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '16px 0' }} />

              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <CarOutlined style={{ color: '#10b981', marginRight: '8px' }} /> Delivery & Pricing Rules
              </h3>

              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item name="deliveryFee" label={<span style={{ fontWeight: 800 }}>Default Delivery Fee (₹)</span>}>
                    <InputNumber size="large" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item name="freeDeliveryThreshold" label={<span style={{ fontWeight: 800 }}>Free Delivery Above (₹)</span>}>
                    <InputNumber size="large" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item name="minOrderAmount" label={<span style={{ fontWeight: 800 }}>Min Order Amount (₹)</span>}>
                    <InputNumber size="large" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item name="deliveryRadius" label={<span style={{ fontWeight: 800 }}>Max Delivery Radius (km)</span>}>
                    <InputNumber size="large" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '16px 0' }} />

              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                🌐 Social Media Channels
              </h3>

              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item name="instagramUrl" label={<span style={{ fontWeight: 800 }}>Instagram Link</span>}>
                    <Input prefix={<InstagramOutlined style={{ color: '#e1306c' }} />} placeholder="https://instagram.com/..." style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item name="facebookUrl" label={<span style={{ fontWeight: 800 }}>Facebook Link</span>}>
                    <Input prefix={<FacebookOutlined style={{ color: '#1877f2' }} />} placeholder="https://facebook.com/..." style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item name="whatsappNumber" label={<span style={{ fontWeight: 800 }}>WhatsApp Number</span>}>
                    <Input prefix={<WhatsAppOutlined style={{ color: '#25d366' }} />} placeholder="+919876543210" style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item name="twitterUrl" label={<span style={{ fontWeight: 800 }}>Twitter / X Link</span>}>
                    <Input prefix={<TwitterOutlined style={{ color: '#1da1f2' }} />} placeholder="https://twitter.com/..." style={{ borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saveLoading}
              style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '12px', padding: '0 40px' }}
            >
              Save Shop Settings
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: 'home',
      label: (
        <span style={{ fontWeight: 800, fontSize: '14px' }}>
          <HomeOutlined /> Home Settings
        </span>
      ),
      children: (
        <Form form={homeForm} layout="vertical" onFinish={handleSaveAll}>
          <Row gutter={[32, 24]}>
            {/* Hero Section Banner */}
            <Col xs={24} md={12}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <PictureOutlined style={{ color: '#ec4899', marginRight: '8px' }} /> Hero Banner & Text Content
              </h3>

              <Form.Item label={<span style={{ fontWeight: 800 }}>Hero Banner Image</span>}>
                <Upload.Dragger beforeUpload={handleBannerSelect} showUploadList={false} accept="image/*" style={{ borderRadius: '12px', background: '#f8fafc', padding: '16px' }}>
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner Preview" style={{ maxHeight: '140px', borderRadius: '8px', margin: '0 auto' }} />
                  ) : (
                    <div>
                      <PictureOutlined style={{ fontSize: '32px', color: '#ec4899' }} />
                      <p style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', margin: '6px 0 2px' }}>Click or Drag Banner Image</p>
                      <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>PNG, JPG, WEBP</p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>

              <Form.Item name="heroTitle" label={<span style={{ fontWeight: 800 }}>Hero Heading Title *</span>}>
                <Input size="large" placeholder="e.g. The Best Cakes For Every Celebration" style={{ borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item name="heroSubtitle" label={<span style={{ fontWeight: 800 }}>Hero Subtitle Description</span>}>
                <Input.TextArea rows={3} placeholder="e.g. Beautifully made cakes, pastries, and sweet moments..." style={{ borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item name="heroCtaText" label={<span style={{ fontWeight: 800 }}>Hero CTA Button Label</span>}>
                <Input size="large" placeholder="Explore Cakes" style={{ borderRadius: '10px' }} />
              </Form.Item>
            </Col>

            {/* Promo Announcement Banner & Section Toggles */}
            <Col xs={24} md={12}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                📢 Top Announcement Bar & Section Toggles
              </h3>

              <Form.Item name="promoMarqueeText" label={<span style={{ fontWeight: 800 }}>Top Marquee Banner Text</span>}>
                <Input size="large" placeholder="🎉 Special Offer: Free Delivery on orders over ₹999!" style={{ borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item label={<span style={{ fontWeight: 800 }}>Promo Banner Card Image</span>}>
                <Upload.Dragger beforeUpload={handlePromoSelect} showUploadList={false} accept="image/*" style={{ borderRadius: '12px', background: '#f8fafc', padding: '16px' }}>
                  {promoPreview ? (
                    <img src={promoPreview} alt="Promo Preview" style={{ maxHeight: '120px', borderRadius: '8px', margin: '0 auto' }} />
                  ) : (
                    <div>
                      <PictureOutlined style={{ fontSize: '28px', color: '#3b82f6' }} />
                      <p style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', margin: '4px 0 0' }}>Upload Promo Image</p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>

              <Divider style={{ margin: '16px 0' }} />

              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                👁️ Home Section Visibility Toggles
              </h3>

              <Space direction="vertical" style={{ width: '100%', gap: '12px' }}>
                <Form.Item name="showHero" valuePropName="checked" label={<span style={{ fontWeight: 700 }}>Show Hero Section</span>} style={{ margin: 0 }}>
                  <Switch checkedChildren="Visible" unCheckedChildren="Hidden" />
                </Form.Item>

                <Form.Item name="showPromo" valuePropName="checked" label={<span style={{ fontWeight: 700 }}>Show Promo Announcement Banner</span>} style={{ margin: 0 }}>
                  <Switch checkedChildren="Visible" unCheckedChildren="Hidden" />
                </Form.Item>

                <Form.Item name="showTestimonials" valuePropName="checked" label={<span style={{ fontWeight: 700 }}>Show Customer Reviews & Testimonials</span>} style={{ margin: 0 }}>
                  <Switch checkedChildren="Visible" unCheckedChildren="Hidden" />
                </Form.Item>
              </Space>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saveLoading}
              style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '12px', padding: '0 40px' }}
            >
              Save Home Settings
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: 'menu',
      label: (
        <span style={{ fontWeight: 800, fontSize: '14px' }}>
          <AppstoreOutlined /> Menu Settings
        </span>
      ),
      children: (
        <Form form={menuForm} layout="vertical" onFinish={handleSaveAll}>
          <Row gutter={[32, 24]}>
            {/* Menu Header & Layout */}
            <Col xs={24} md={12}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <AppstoreOutlined style={{ color: '#f43f5e', marginRight: '8px' }} /> Menu Header Content
              </h3>

              <Form.Item name="menuTitle" label={<span style={{ fontWeight: 800 }}>Menu Section Title *</span>}>
                <Input size="large" placeholder="e.g. Explore Our Bakery Menu" style={{ borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item name="menuSubtitle" label={<span style={{ fontWeight: 800 }}>Menu Description Subtitle</span>}>
                <Input.TextArea rows={3} placeholder="e.g. Handcrafted cakes, fresh savory snacks & artisanal desserts." style={{ borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item name="menuGridCols" label={<span style={{ fontWeight: 800 }}>Catalog Grid Display Columns</span>}>
                <Select size="large" style={{ borderRadius: '10px' }}>
                  <Select.Option value={3}>3 Columns Layout</Select.Option>
                  <Select.Option value={4}>4 Columns Layout (Recommended)</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Menu Filters & Options */}
            <Col xs={24} md={12}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                ⚡ Menu Features & Dietary Filters
              </h3>

              <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
                <Form.Item name="showCategoryPills" valuePropName="checked" label={<span style={{ fontWeight: 700 }}>Show Category Pills Navigation Bar</span>} style={{ margin: 0 }}>
                  <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                </Form.Item>

                <Form.Item name="enableVegFilter" valuePropName="checked" label={<span style={{ fontWeight: 700 }}>Enable 100% Pure Veg / Eggless Filter</span>} style={{ margin: 0 }}>
                  <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                </Form.Item>

                <Form.Item name="enableCustomCakeNotes" valuePropName="checked" label={<span style={{ fontWeight: 700 }}>Enable Custom Cake Writing Note Box on Checkout</span>} style={{ margin: 0 }}>
                  <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                </Form.Item>
              </Space>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saveLoading}
              style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '12px', padding: '0 40px' }}
            >
              Save Menu Settings
            </Button>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Header Info */}
      <div className="page-header-card">
        <div className="header-info">
          <span className="badge-pill">
            <SettingOutlined /> Control Panel Configuration
          </span>
          <h2>Control Panel Settings</h2>
          <p>Configure Store Profile, Home Banner, and Menu Catalog features served to customer Frontend.</p>
        </div>
      </div>

      <Card style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }} loading={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          type="line"
          tabBarStyle={{ marginBottom: '24px' }}
        />
      </Card>
    </div>
  );
};

export default Settings;
