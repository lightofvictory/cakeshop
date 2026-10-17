import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Form, Input, InputNumber, Switch, Button, Row, Col, Upload, Tabs, Divider, Select, Space, Modal } from 'antd';
import {
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
  PlusOutlined,
  DeleteOutlined,
  DownOutlined,
  UpOutlined,
  RightOutlined,
  EditOutlined,
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
  const [shopDescriptionState, setShopDescriptionState] = useState('');

  // File states for uploads
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [promoFile, setPromoFile] = useState(null);
  const [promoPreview, setPromoPreview] = useState('');
  const [footerFile, setFooterFile] = useState(null);
  const [footerPreview, setFooterPreview] = useState('');

  // Hero Banners Carousel List State
  const [heroBannersList, setHeroBannersList] = useState([]);

  // Outlets / Branches List State
  const [outletsList, setOutletsList] = useState([]);

  // Carousel Slide Modal State
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState(null);
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    ctaText: 'Order Now',
    ctaLink: '/menu',
    image: '',
    preview: '',
    file: null,
  });

  const handleOpenAddSlideModal = () => {
    setEditingSlideIndex(null);
    setSlideFormData({
      title: '',
      subtitle: '',
      description: '',
      ctaText: 'Order Now',
      ctaLink: '/menu',
      image: '',
      preview: '',
      file: null,
    });
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlideModal = (index) => {
    setEditingSlideIndex(index);
    setSlideFormData({ ...heroBannersList[index] });
    setIsSlideModalOpen(true);
  };

  const handleSaveSlideModal = () => {
    if (editingSlideIndex === null) {
      setHeroBannersList((prev) => [...prev, slideFormData]);
      toast.success('Carousel Slide added');
    } else {
      setHeroBannersList((prev) => {
        const updated = [...prev];
        updated[editingSlideIndex] = slideFormData;
        return updated;
      });
      toast.success(`Slide #${editingSlideIndex + 1} updated`);
    }
    setIsSlideModalOpen(false);
  };

  const handleModalImageSelect = (file) => {
    const previewUrl = URL.createObjectURL(file);
    setSlideFormData((prev) => ({
      ...prev,
      file: file,
      preview: previewUrl,
    }));
    return false;
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${url}/api/settings`);
      if (res.data && res.data.success && res.data.data) {
        const d = res.data.data;
        const descText = d.shopDescription || (d.shopSettings && d.shopSettings.shopDescription) || '';
        setShopDescriptionState(descText);
        shopForm.setFieldsValue({
          ...d,
          ...(d.shopSettings || {}),
          shopDescription: descText,
        });
        homeForm.setFieldsValue(d);
        menuForm.setFieldsValue(d);

        if (d.logo) setLogoPreview(`${url}/images/${d.logo}`);
        if (d.bannerImage) setBannerPreview(`${url}/images/${d.bannerImage}`);
        if (d.promoBannerImage) setPromoPreview(`${url}/images/${d.promoBannerImage}`);

        const sName = d.shopName || (d.shopSettings && d.shopSettings.shopName);
        if (sName) {
          document.title = sName;
        }
        const logoName = d.logo || (d.shopSettings && d.shopSettings.logo);
        if (logoName) {
          const logoUrl = `${url}/images/${logoName}`;
          let favicon = document.querySelector("link[rel*='icon']");
          if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(favicon);
          }
          favicon.href = logoUrl;
        }

        const banners =
          d.homeSettings && Array.isArray(d.homeSettings.heroBanners) && d.homeSettings.heroBanners.length > 0
            ? d.homeSettings.heroBanners
            : Array.isArray(d.heroBanners) && d.heroBanners.length > 0
            ? d.heroBanners
            : [
                {
                  title: 'BOLD FLAVORS.',
                  subtitle: 'EPIC CRAVINGS. Live Bakes',
                  description: 'Your sweet favorites, made fresh daily.',
                  image: d.bannerImage || '',
                  ctaText: 'Order Now',
                  ctaLink: '/menu',
                },
                {
                  title: 'FRESHLY BAKED',
                  subtitle: 'ARTISANAL PASTRIES',
                  description: 'Handcrafted daily with love & premium cocoa.',
                  image: d.bannerImage || '',
                  ctaText: 'Explore Menu',
                  ctaLink: '/menu',
                },
                {
                  title: 'CELEBRATE MORE',
                  subtitle: 'CUSTOM PARTY CAKES',
                  description: 'Make every birthday & event unforgettable.',
                  image: d.bannerImage || '',
                  ctaText: 'Order Special',
                  ctaLink: '/extra-special',
                },
              ];

        setHeroBannersList(
          banners.map((b) => ({
            ...b,
            preview: b.image ? (b.image.startsWith('http') ? b.image : `${url}/images/${b.image}`) : '',
          }))
        );

        const loadedOutlets = d.outlets || (d.shopSettings && d.shopSettings.outlets) || [
          { id: '1', name: 'Flagship Bakery - Downtown', address: '100 Cake Avenue, Downtown', phone: '+919876543210', isActive: true }
        ];
        setOutletsList(loadedOutlets);
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

  const handleBannerItemChange = (index, field, value) => {
    setHeroBannersList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleBannerItemImageSelect = (index, file) => {
    const previewUrl = URL.createObjectURL(file);
    setHeroBannersList((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        file: file,
        preview: previewUrl,
      };
      return updated;
    });
    return false;
  };

  const handleAddBannerSlide = () => {
    setHeroBannersList((prev) => [
      ...prev,
      {
        title: 'SPECIAL OFFER',
        subtitle: 'SWEET DELIGHTS',
        description: 'Made fresh with organic ingredients & cream.',
        image: '',
        preview: '',
        ctaText: 'Order Now',
        ctaLink: '/menu',
      },
    ]);
  };

  const handleRemoveBannerSlide = (index) => {
    if (heroBannersList.length <= 1) {
      toast.warning('At least 1 hero banner slide is required');
      return;
    }
    setHeroBannersList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async (values) => {
    setSaveLoading(true);
    const formData = new FormData();

    const shopDesc =
      values && values.shopDescription !== undefined && values.shopDescription !== null
        ? values.shopDescription
        : shopForm.getFieldValue('shopDescription');

    const combinedValues = {
      ...shopForm.getFieldsValue(true),
      ...homeForm.getFieldsValue(true),
      ...menuForm.getFieldsValue(true),
      ...values,
    };

    if (shopDesc !== undefined && shopDesc !== null) {
      combinedValues.shopDescription = shopDesc;
    }

    const excludeKeys = ['_id', '__v', 'createdAt', 'updatedAt', 'shopSettings', 'homeSettings', 'menuSettings', 'heroBanners', 'logo', 'bannerImage', 'promoBannerImage'];
    Object.keys(combinedValues).forEach((key) => {
      const val = combinedValues[key];
      if (val !== undefined && val !== null && !excludeKeys.includes(key)) {
        if (typeof val === 'object' && !(val instanceof File)) {
          return;
        }
        formData.append(key, val);
      }
    });

    if (logoFile) formData.append('logo', logoFile);
    if (bannerFile) formData.append('bannerImage', bannerFile);
    if (promoFile) formData.append('promoBannerImage', promoFile);

    // Append heroBanners JSON and files
    const preparedBanners = heroBannersList.map((item, idx) => {
      const bannerItem = {
        title: item.title || '',
        subtitle: item.subtitle || '',
        description: item.description || '',
        image: item.image || '',
        ctaText: item.ctaText || 'Order Now',
        ctaLink: item.ctaLink || '/menu',
      };
      if (item.file) {
        formData.append(`heroBanner_${idx}`, item.file);
      }
      return bannerItem;
    });

    formData.append('heroBanners', JSON.stringify(preparedBanners));
    formData.append('outlets', JSON.stringify(outletsList));

    try {
      const res = await axios.post(`${url}/api/settings`, formData);
      if (res.data && res.data.success) {
        toast.success('🎉 Settings & Hero Banners updated and synced live to Frontend!');

        // Broadcast to Frontend to update settings immediately without polling
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('mrpastry_settings_channel');
          channel.postMessage('SETTINGS_UPDATED');
          channel.close();
        }
        localStorage.setItem('mrpastry_settings_updated', Date.now().toString());
        if (res.data.data) {
          const d = res.data.data;
          const savedShopDesc =
            d.shopDescription !== undefined && d.shopDescription !== null
              ? d.shopDescription
              : d.shopSettings && d.shopSettings.shopDescription !== undefined
              ? d.shopSettings.shopDescription
              : shopDesc || '';

          shopForm.setFieldsValue({
            ...d,
            ...(d.shopSettings || {}),
            shopDescription: savedShopDesc,
          });
          homeForm.setFieldsValue({
            ...d,
            ...(d.homeSettings || {}),
          });
          menuForm.setFieldsValue({
            ...d,
            ...(d.menuSettings || {}),
          });
        }
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
        <Form form={shopForm} layout="vertical" onFinish={handleSaveAll} style={{ width: '100%' }}>
          <Row gutter={[24, 24]} style={{ width: '100%' }}>
            {/* Logo & Contact */}
            <Col span={24}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <ShopOutlined style={{ color: '#f43f5e', marginRight: '8px' }} /> Store Logo & Identity
              </h3>

              <Form.Item label={<span style={{ fontWeight: 800 }}>Shop Logo Image</span>}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
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
                <Input size="large" prefix={<ShopOutlined />} style={{ width: '100%', borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item name="tagline" label={<span style={{ fontWeight: 800 }}>Tagline / Subtitle</span>}>
                <Input size="large" style={{ width: '100%', borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item name="shopDescription" label={<span style={{ fontWeight: 800 }}>Shop Description *</span>}>
                <Input.TextArea
                  rows={3}
                  placeholder="Enter your shop description..."
                  style={{ width: '100%', borderRadius: '10px' }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <EnvironmentOutlined style={{ color: '#3b82f6', marginRight: '8px' }} /> Location & Support Contact
              </h3>

              <Form.Item name="address" label={<span style={{ fontWeight: 800 }}>Street Address *</span>}>
                <Input size="large" prefix={<EnvironmentOutlined />} placeholder="e.g. 123 Bakery Lane, MG Road" style={{ width: '100%', borderRadius: '10px' }} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="city" label={<span style={{ fontWeight: 800 }}>City *</span>}>
                    <Input size="large" placeholder="e.g. Mumbai" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item name="pincode" label={<span style={{ fontWeight: 800 }}>Pincode *</span>}>
                    <Input size="large" placeholder="e.g. 400001" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label={<span style={{ fontWeight: 800 }}>Contact Phone *</span>}>
                    <Input size="large" prefix={<PhoneOutlined />} style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item name="email" label={<span style={{ fontWeight: 800 }}>Support Email *</span>}>
                    <Input size="large" prefix={<MailOutlined />} style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="senderGmail" label={<span style={{ fontWeight: 800 }}>Official Bakery Sender Email (Customer Verification) *</span>}>
                    <Input size="large" prefix={<MailOutlined style={{ color: '#ea4335' }} />} placeholder="mrpastrybakery@gmail.com" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item name="web3FormsKey" label={<span style={{ fontWeight: 800 }}>Email Security Dispatch Key *</span>}>
                    <Input size="large" placeholder="c74fae99-8738-4e3c-83b3-df77ee138b30" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Outlets / Branches Management */}
            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    <EnvironmentOutlined style={{ color: '#f43f5e', marginRight: '8px' }} /> Store Outlets & Branches
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                    Note: If you have only 1 outlet, the outlet switcher is hidden in the Admin Portal. When you have 2 or more outlets, the Outlet Switcher is automatically shown in the top header!
                  </p>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    const newId = (outletsList.length + 1).toString();
                    setOutletsList([
                      ...outletsList,
                      { id: newId, name: `Branch #${newId} - Bakery`, address: 'Branch Address', phone: '+919876543210', isActive: true }
                    ]);
                    toast.info('New branch outlet added. Save settings to publish.');
                  }}
                  style={{ borderRadius: '8px', background: '#f43f5e', border: 0, fontWeight: 700 }}
                >
                  Add Outlet Branch
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {outletsList.map((outlet, index) => (
                  <Card key={outlet.id || index} size="small" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <Row gutter={12} align="middle">
                      <Col xs={24} sm={7}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>Outlet Name</label>
                        <Input
                          value={outlet.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOutletsList((prev) => {
                              const updated = [...prev];
                              updated[index] = { ...updated[index], name: val };
                              return updated;
                            });
                          }}
                          placeholder="e.g. Westside Branch"
                          style={{ borderRadius: '8px', marginTop: '4px', fontWeight: 700 }}
                        />
                      </Col>
                      <Col xs={24} sm={10}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>Address / Location</label>
                        <Input
                          value={outlet.address}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOutletsList((prev) => {
                              const updated = [...prev];
                              updated[index] = { ...updated[index], address: val };
                              return updated;
                            });
                          }}
                          placeholder="e.g. Level 2, Westside Mall"
                          style={{ borderRadius: '8px', marginTop: '4px' }}
                        />
                      </Col>
                      <Col xs={18} sm={5}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>Phone</label>
                        <Input
                          value={outlet.phone}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOutletsList((prev) => {
                              const updated = [...prev];
                              updated[index] = { ...updated[index], phone: val };
                              return updated;
                            });
                          }}
                          placeholder="Phone number"
                          style={{ borderRadius: '8px', marginTop: '4px' }}
                        />
                      </Col>
                      <Col xs={6} sm={2} style={{ textAlign: 'right' }}>
                        {outletsList.length > 1 && (
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setOutletsList((prev) => prev.filter((_, i) => i !== index));
                              toast.info('Outlet branch removed');
                            }}
                          />
                        )}
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </Col>

            {/* Operating Hours, Delivery & Social Links */}
            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <ClockCircleOutlined style={{ color: '#9333ea', marginRight: '8px' }} /> Store Operating Hours
              </h3>

              <Form.Item name="storeOpen" valuePropName="checked" label={<span style={{ fontWeight: 800 }}>Store Operating Status</span>}>
                <Switch checkedChildren="🟢 Store Open" unCheckedChildren="🔴 Store Closed" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="openTime" label={<span style={{ fontWeight: 800 }}>Opening Time</span>}>
                    <Input size="large" placeholder="08:00" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="closeTime" label={<span style={{ fontWeight: 800 }}>Closing Time</span>}>
                    <Input size="large" placeholder="22:00" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <CarOutlined style={{ color: '#10b981', marginRight: '8px' }} /> Delivery & Pricing Rules
              </h3>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="deliveryFee" label={<span style={{ fontWeight: 800 }}>Default Delivery Fee (₹)</span>}>
                    <InputNumber size="large" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="freeDeliveryThreshold" label={<span style={{ fontWeight: 800 }}>Free Delivery Above (₹)</span>}>
                    <InputNumber size="large" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="minOrderAmount" label={<span style={{ fontWeight: 800 }}>Min Order Amount (₹)</span>}>
                    <InputNumber size="large" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="deliveryRadius" label={<span style={{ fontWeight: 800 }}>Max Delivery Radius (km)</span>}>
                    <InputNumber size="large" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                🌐 Social Media Channels
              </h3>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="instagramUrl" label={<span style={{ fontWeight: 800 }}>Instagram Link</span>}>
                    <Input prefix={<InstagramOutlined style={{ color: '#e1306c' }} />} placeholder="https://instagram.com/..." style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="facebookUrl" label={<span style={{ fontWeight: 800 }}>Facebook Link</span>}>
                    <Input prefix={<FacebookOutlined style={{ color: '#1877f2' }} />} placeholder="https://facebook.com/..." style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="whatsappNumber" label={<span style={{ fontWeight: 800 }}>WhatsApp Number</span>}>
                    <Input prefix={<WhatsAppOutlined style={{ color: '#25d366' }} />} placeholder="+919876543210" style={{ width: '100%', borderRadius: '10px' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="twitterUrl" label={<span style={{ fontWeight: 800 }}>Twitter / X Link</span>}>
                    <Input prefix={<TwitterOutlined style={{ color: '#1da1f2' }} />} placeholder="https://twitter.com/..." style={{ width: '100%', borderRadius: '10px' }} />
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
        <Form form={homeForm} layout="vertical" onFinish={handleSaveAll} style={{ width: '100%' }}>
          <Row gutter={[24, 24]} style={{ width: '100%' }}>
            {/* Carousel Banners Slides Manager */}
            <Col span={24}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  background: '#fff0f3',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #fecdd3',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#9f1239', margin: 0 }}>
                    <PictureOutlined style={{ color: '#f43f5e', marginRight: '8px' }} /> Carousel Banners ({heroBannersList.length} Active Carousel Slides)
                  </h3>
                  <p style={{ fontSize: '11px', color: '#be123c', margin: '2px 0 0' }}>
                    Manage Carousel Banners {`{title, description, image}`} to auto-scroll in home view & desktop header.
                  </p>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleOpenAddSlideModal}
                  style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '10px' }}
                >
                  Add Carousel Slide
                </Button>
              </div>

              <Row gutter={[16, 16]}>
                {heroBannersList.map((banner, index) => (
                  <Col xs={24} md={12} key={index}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: '14px',
                        border: '1px solid #ffe4e6',
                        background: '#ffffff',
                        boxShadow: '0 4px 14px rgba(244, 63, 94, 0.05)',
                      }}
                      styles={{ body: { padding: '14px' } }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span
                          style={{
                            background: '#ffe4e6',
                            color: '#e11d48',
                            fontWeight: 800,
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: '1px solid #fecdd3',
                          }}
                        >
                          Slide #{index + 1}
                        </span>
                        <Space>
                          <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenEditSlideModal(index)}
                            style={{ backgroundColor: '#f43f5e', fontWeight: 700, borderRadius: '8px', fontSize: '12px' }}
                          >
                            Edit Slide
                          </Button>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveBannerSlide(index)}
                            title="Remove slide"
                          />
                        </Space>
                      </div>

                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        {banner.preview ? (
                          <img
                            src={banner.preview}
                            alt="Slide Preview"
                            style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #fecdd3', flexShrink: 0 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '70px',
                              height: '70px',
                              borderRadius: '10px',
                              background: '#f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px dashed #cbd5e1',
                              flexShrink: 0,
                            }}
                          >
                            <PictureOutlined style={{ fontSize: '24px', color: '#f43f5e' }} />
                          </div>
                        )}

                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {banner.title || 'Untitled Eyebrow'}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f43f5e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            {banner.subtitle || 'No Subtitle'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '3px' }}>
                            {banner.description || 'No Description'}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>

            {/* Modal for Editing / Adding Carousel Slide */}
            <Modal
              centered
              title={
                <span style={{ fontWeight: 800, color: '#9f1239', fontSize: '16px' }}>
                  <PictureOutlined style={{ color: '#f43f5e', marginRight: '8px' }} />
                  {editingSlideIndex !== null ? `Edit Carousel Slide #${editingSlideIndex + 1}` : 'Add New Carousel Slide'}
                </span>
              }
              open={isSlideModalOpen}
              onOk={handleSaveSlideModal}
              onCancel={() => setIsSlideModalOpen(false)}
              okText="Save Slide ✨"
              okButtonProps={{ style: { backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '8px' } }}
              cancelButtonProps={{ style: { borderRadius: '8px' } }}
              width={540}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
                <div>
                  <label style={{ fontWeight: 700, fontSize: '12px', display: 'block', marginBottom: '4px', color: '#334155' }}>
                    Eyebrow Tag / Title
                  </label>
                  <Input
                    value={slideFormData.title}
                    onChange={(e) => setSlideFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. SPECIAL OFFER"
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 700, fontSize: '12px', display: 'block', marginBottom: '4px', color: '#334155' }}>
                    Heading Subtitle
                  </label>
                  <Input
                    value={slideFormData.subtitle}
                    onChange={(e) => setSlideFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Freshly Baked Everyday"
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 700, fontSize: '12px', display: 'block', marginBottom: '4px', color: '#334155' }}>
                    Description
                  </label>
                  <Input.TextArea
                    rows={3}
                    value={slideFormData.description}
                    onChange={(e) => setSlideFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Thoughtfully prepared cakes and pastries..."
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 700, fontSize: '12px', display: 'block', marginBottom: '4px', color: '#334155' }}>
                    Slide Image Upload
                  </label>
                  <Upload.Dragger
                    beforeUpload={handleModalImageSelect}
                    showUploadList={false}
                    accept="image/*"
                    style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}
                  >
                    {slideFormData.preview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <img src={slideFormData.preview} alt="Slide Preview" style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>Click to change image ✓</span>
                      </div>
                    ) : (
                      <div>
                        <PictureOutlined style={{ fontSize: '28px', color: '#f43f5e' }} />
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', fontWeight: 600 }}>Drag & drop image here, or click to browse</p>
                      </div>
                    )}
                  </Upload.Dragger>
                </div>

                <div>
                  <label style={{ fontWeight: 700, fontSize: '12px', display: 'block', marginBottom: '4px', color: '#334155' }}>
                    Button Text
                  </label>
                  <Input
                    value={slideFormData.ctaText}
                    onChange={(e) => setSlideFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                    placeholder="Order Now"
                  />
                </div>
              </div>
            </Modal>

            {/* Promo Announcement Banner & Section Toggles */}
            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                📢 Top Announcement Bar & Section Toggles
              </h3>

              <Form.Item name="promoMarqueeText" label={<span style={{ fontWeight: 800 }}>Top Marquee Banner Text</span>}>
                <Input size="large" placeholder="🎉 Special Offer: Free Delivery on orders over ₹999!" style={{ width: '100%', borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item label={<span style={{ fontWeight: 800 }}>Promo Banner Card Image</span>}>
                <Upload.Dragger beforeUpload={handlePromoSelect} showUploadList={false} accept="image/*" style={{ width: '100%', borderRadius: '12px', background: '#f8fafc', padding: '24px' }}>
                  {promoPreview ? (
                    <img src={promoPreview} alt="Promo Preview" style={{ maxHeight: '160px', borderRadius: '8px', margin: '0 auto', maxWidth: '100%' }} />
                  ) : (
                    <div>
                      <PictureOutlined style={{ fontSize: '32px', color: '#3b82f6' }} />
                      <p style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', margin: '6px 0 0' }}>Upload Promo Image (Full Width)</p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>

              <Divider style={{ margin: '16px 0' }} />

              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                👁️ Home Section Visibility Toggles
              </h3>

              <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
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
        <Form form={menuForm} layout="vertical" onFinish={handleSaveAll} style={{ width: '100%' }}>
          <Row gutter={[24, 24]} style={{ width: '100%' }}>
            {/* Menu Header & Layout */}
            <Col span={24}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                <AppstoreOutlined style={{ color: '#f43f5e', marginRight: '8px' }} /> Menu Header Content
              </h3>

              <Form.Item name="menuTitle" label={<span style={{ fontWeight: 800 }}>Menu Section Title *</span>}>
                <Input size="large" placeholder="e.g. Explore Our Bakery Menu" style={{ width: '100%', borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item name="menuSubtitle" label={<span style={{ fontWeight: 800 }}>Menu Description Subtitle</span>}>
                <Input.TextArea rows={3} placeholder="e.g. Handcrafted cakes, fresh savory snacks & artisanal desserts." style={{ width: '100%', borderRadius: '10px' }} />
              </Form.Item>

              <Form.Item name="menuGridCols" label={<span style={{ fontWeight: 800 }}>Catalog Grid Display Columns</span>}>
                <Select size="large" style={{ width: '100%', borderRadius: '10px' }}>
                  <Select.Option value={3}>3 Columns Layout</Select.Option>
                  <Select.Option value={4}>4 Columns Layout (Recommended)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="defaultOfferPercentage" label={<span style={{ fontWeight: 800 }}>🏷️ Catalog Default Item Offer / Discount</span>}>
                <Select size="large" style={{ width: '100%', borderRadius: '10px' }}>
                  <Select.Option value={0}>No Default Offer (0%)</Select.Option>
                  <Select.Option value={5}>5% OFF Default</Select.Option>
                  <Select.Option value={10}>10% OFF Default</Select.Option>
                  <Select.Option value={15}>15% OFF Default</Select.Option>
                  <Select.Option value={20}>20% OFF Default</Select.Option>
                  <Select.Option value={25}>25% OFF Default</Select.Option>
                  <Select.Option value={30}>30% OFF Default</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Menu Filters & Options */}
            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
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
