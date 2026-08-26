import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Form, Input, Select, Button, Upload, Tag, Row, Col } from 'antd';
import {
  PlusCircleOutlined,
  UploadOutlined,
  DollarOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const categoriesList = [
  { name: 'Cake Item', desc: 'Custom & Gourmet Cakes', emoji: '🧁' },
  { name: 'Snakes Item', desc: 'Fast Food & Munchies', emoji: '🍿' },
  { name: 'Deserts Item', desc: 'Cupcakes & Puddings', emoji: '🍨' },
  { name: 'Salad Item', desc: 'Fresh Organic Bowls', emoji: '🥗' },
  { name: 'Pure Veg', desc: '100% Eggless Special', emoji: '🌿' },
  { name: 'Pasta Item', desc: 'Italian & Pastas', emoji: '🍝' },
  { name: 'Cookies Item', desc: 'Fresh Baked Biscuits', emoji: '🍪' },
  { name: 'Sweet Items', desc: 'Traditional Sweets', emoji: '🍩' },
];

const Add = () => {
  const url = 'http://localhost:3000';
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Cake Item',
  });
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file) => {
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    return false; // prevent auto upload
  };

  const onSubmitHandler = async () => {
    if (!image) {
      toast.error('Please upload a product image!');
      return;
    }
    if (!data.name || !data.price || !data.description) {
      toast.error('Please fill in all required fields!');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', Number(data.price));
    formData.append('category', data.category);
    formData.append('image', image);

    try {
      const response = await axios.post(`${url}/api/items`, formData);
      if (response.data && response.data.success) {
        toast.success('🎉 Product added successfully to inventory!');
        setData({
          name: '',
          description: '',
          price: '',
          category: 'Cake Item',
        });
        setImage(null);
        setPreviewUrl('');
        navigate('/list');
      } else {
        toast.error(response.data?.message || 'Error adding product');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit product to backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="page-header-card">
        <div className="header-info">
          <span className="badge-pill">
            <PlusCircleOutlined /> Inventory Management
          </span>
          <h2>Add New Bakery Product</h2>
          <p>Publish product details to live database for Frontend customer catalog.</p>
        </div>
      </div>

      <Card style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }} bodyStyle={{ padding: '32px' }}>
        <Form layout="vertical" onFinish={onSubmitHandler}>
          <Row gutter={[24, 24]}>
            {/* Image Upload Column */}
            <Col xs={24} md={8}>
              <Form.Item label={<span style={{ fontWeight: 800 }}>Product Image *</span>}>
                <Upload.Dragger
                  beforeUpload={handleImageChange}
                  showUploadList={false}
                  accept="image/*"
                  style={{ borderRadius: '12px', background: '#f8fafc', padding: '24px' }}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: '180px', borderRadius: '12px', margin: '0 auto' }} />
                  ) : (
                    <div>
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ fontSize: '36px', color: '#f43f5e' }} />
                      </p>
                      <p style={{ fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>Click or Drag Image Here</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>
            </Col>

            {/* Fields Column */}
            <Col xs={24} md={16}>
              <Form.Item label={<span style={{ fontWeight: 800 }}>Product Title *</span>}>
                <Input
                  size="large"
                  name="name"
                  value={data.name}
                  onChange={onChangeHandler}
                  placeholder="e.g. Royal Belgian Truffle Cake"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label={<span style={{ fontWeight: 800 }}>Price (INR ₹) *</span>}>
                    <Input
                      size="large"
                      type="number"
                      name="price"
                      value={data.price}
                      onChange={onChangeHandler}
                      placeholder="e.g. 499"
                      prefix={<DollarOutlined />}
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label={<span style={{ fontWeight: 800 }}>Product Category *</span>}>
                    <Select
                      size="large"
                      value={data.category}
                      onChange={(value) => setData((prev) => ({ ...prev, category: value }))}
                      style={{ borderRadius: '10px' }}
                    >
                      {categoriesList.map((cat) => (
                        <Select.Option key={cat.name} value={cat.name}>
                          {cat.emoji} {cat.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={<span style={{ fontWeight: 800 }}>Description *</span>}>
                <Input.TextArea
                  rows={4}
                  name="description"
                  value={data.description}
                  onChange={onChangeHandler}
                  placeholder="Describe ingredients, taste profile, and baking highlights..."
                  style={{ borderRadius: '10px' }}
                />
              </Form.Item>

              {/* Category Selector Chips */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Select Category Chip</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {categoriesList.map((cat) => (
                    <Tag.CheckableTag
                      key={cat.name}
                      checked={data.category === cat.name}
                      onChange={() => setData((prev) => ({ ...prev, category: cat.name }))}
                      style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
                    >
                      {cat.emoji} {cat.name}
                    </Tag.CheckableTag>
                  ))}
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '12px', padding: '0 36px' }}
              >
                ✨ Publish Product to Inventory
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default Add;
