import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Table, Input, Button, Tag, Popconfirm, Modal, Form, Select, Upload, Row, Col, Space } from 'antd';
import {
  UnorderedListOutlined,
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

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

const List = () => {
  const url = 'http://localhost:3000';
  const [searchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Cake Item',
  });

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/items`);
      if (response.data && response.data.success) {
        setList(response.data.data);
      } else {
        toast.error('Failed to load item list');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to NestJS API');
    } finally {
      setLoading(false);
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.delete(`${url}/api/items/${foodId}`);
      if (response.data && response.data.success) {
        toast.success('Item deleted successfully!');
        fetchList();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error removing product');
    }
  };

  const handleImageChange = (file) => {
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    return false; // prevent auto upload
  };

  const handleCreateSubmit = async () => {
    if (!image) {
      toast.error('Please upload a product image!');
      return;
    }
    if (!formData.name || !formData.price || !formData.description) {
      toast.error('Please fill in all required fields!');
      return;
    }

    setSubmitLoading(true);
    const bodyFormData = new FormData();
    bodyFormData.append('name', formData.name);
    bodyFormData.append('description', formData.description);
    bodyFormData.append('price', Number(formData.price));
    bodyFormData.append('category', formData.category);
    bodyFormData.append('image', image);

    try {
      const response = await axios.post(`${url}/api/items`, bodyFormData);
      if (response.data && response.data.success) {
        toast.success('🎉 Product created successfully!');
        setIsModalOpen(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'Cake Item',
        });
        setImage(null);
        setPreviewUrl('');
        fetchList();
      } else {
        toast.error(response.data?.message || 'Error creating product');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit product');
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    if (searchParams.get('openCreate') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const filteredList = list.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', ...Array.from(new Set(list.map((i) => i.category)))];

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (img) => (
        <img
          src={img ? `${url}/images/${img}` : 'https://placehold.co/80x80'}
          alt="product"
          style={{ width: '54px', height: '54px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #f1f5f9' }}
        />
      ),
    },
    {
      title: 'Product Title',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{name}</strong>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{record.description}</p>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="rose" style={{ fontWeight: 800 }}>{cat}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <strong style={{ fontSize: '15px', color: '#0f172a', fontWeight: 900 }}>₹{price}</strong>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Delete Product?"
          description="Are you sure you want to remove this item from live inventory?"
          onConfirm={() => removeFood(record._id)}
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button danger icon={<DeleteOutlined />} size="small" style={{ fontWeight: 700 }}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="page-header-card">
        <div className="header-info">
          <span className="badge-pill">
            <UnorderedListOutlined /> Stock & Catalog Overview
          </span>
          <h2>Products Catalog</h2>
          <p>Manage, search, filter, and create products for your live customer shop.</p>
        </div>

        {/* Top Right Corner Create Product Button */}
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '12px', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)' }}
          onClick={() => setIsModalOpen(true)}
        >
          + Create Product
        </Button>
      </div>

      <Card style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
        <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
          {/* Search & Categories Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px' }}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search products by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '320px', borderRadius: '10px' }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categories.map((cat) => (
                <Tag.CheckableTag
                  key={cat}
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                  style={{ padding: '4px 12px', borderRadius: '8px', fontWeight: 700 }}
                >
                  {cat}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredList}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        </Space>
      </Card>

      {/* Ant Design Create Product Modal */}
      <Modal
        title={<span style={{ fontWeight: 800, fontSize: '18px' }}>✨ Create New Product</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={680}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleCreateSubmit} style={{ marginTop: '16px' }}>
          <Row gutter={[16, 16]}>
            {/* Image Upload */}
            <Col xs={24} sm={8}>
              <Form.Item label={<span style={{ fontWeight: 800 }}>Product Image *</span>}>
                <Upload.Dragger
                  beforeUpload={handleImageChange}
                  showUploadList={false}
                  accept="image/*"
                  style={{ borderRadius: '12px', background: '#f8fafc', padding: '16px' }}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: '140px', borderRadius: '8px', margin: '0 auto' }} />
                  ) : (
                    <div>
                      <UploadOutlined style={{ fontSize: '28px', color: '#f43f5e' }} />
                      <p style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', margin: '6px 0 2px' }}>Upload Image</p>
                      <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>
            </Col>

            {/* Inputs */}
            <Col xs={24} sm={16}>
              <Form.Item label={<span style={{ fontWeight: 800 }}>Product Title *</span>}>
                <Input
                  size="large"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Royal Belgian Truffle Cake"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Item>

              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item label={<span style={{ fontWeight: 800 }}>Price (INR ₹) *</span>}>
                    <Input
                      size="large"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 499"
                      prefix={<DollarOutlined />}
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={12}>
                  <Form.Item label={<span style={{ fontWeight: 800 }}>Category *</span>}>
                    <Select
                      size="large"
                      value={formData.category}
                      onChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
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
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe ingredients, taste profile..."
                  style={{ borderRadius: '10px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Category Chips Selection */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Select Category Chip</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categoriesList.map((cat) => (
                <Tag.CheckableTag
                  key={cat.name}
                  checked={formData.category === cat.name}
                  onChange={() => setFormData((prev) => ({ ...prev, category: cat.name }))}
                  style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}
                >
                  {cat.emoji} {cat.name}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: '8px', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              style={{ backgroundColor: '#f43f5e', borderRadius: '8px', fontWeight: 800, padding: '0 24px' }}
            >
              Publish Item
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default List;
