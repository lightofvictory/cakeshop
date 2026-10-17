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
  EditOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const List = () => {
  const { isAdmin } = useAuth();
  const url = 'http://localhost:3000';
  const [searchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Cake Item',
  });

  const [dbOffers, setDbOffers] = useState([]);

  const fetchList = async () => {
    try {
      const [itemsRes, catRes, offerRes] = await Promise.all([
        axios.get(`${url}/api/items`),
        axios.get(`${url}/api/categories`),
        axios.get(`${url}/api/offers`),
      ]);
      if (itemsRes.data && itemsRes.data.success) {
        setList(itemsRes.data.data);
      }
      if (catRes.data && catRes.data.success) {
        setDbCategories(catRes.data.data);
      }
      if (offerRes.data && offerRes.data.success && Array.isArray(offerRes.data.data)) {
        setDbOffers(offerRes.data.data.filter((o) => o.isActive));
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
    return false;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      price: '',
      selectedOfferId: 'NONE',
      offerType: 'PERCENTAGE',
      offerPercentage: 0,
      flatAmount: 0,
      category: 'Cake Item',
    });
    setImage(null);
    setPreviewUrl('');
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOfferSelect = (offerId) => {
    if (!offerId || offerId === 'NONE') {
      setFormData((prev) => ({
        ...prev,
        selectedOfferId: 'NONE',
        offerType: 'PERCENTAGE',
        offerPercentage: 0,
        flatAmount: 0,
      }));
      return;
    }
    const found = dbOffers.find((o) => o._id === offerId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        selectedOfferId: found._id,
        offerType: found.offerType || (found.flatAmount ? 'FLAT' : 'PERCENTAGE'),
        offerPercentage: found.offerPercentage || 0,
        flatAmount: found.flatAmount || 0,
      }));
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    let matchedOfferId = 'NONE';
    if (item.offerType === 'FLAT' && item.flatAmount) {
      const match = dbOffers.find((o) => o.offerType === 'FLAT' && o.flatAmount === item.flatAmount);
      if (match) matchedOfferId = match._id;
    } else if (item.offerPercentage) {
      const match = dbOffers.find((o) => o.offerPercentage === item.offerPercentage);
      if (match) matchedOfferId = match._id;
    }

    setFormData({
      name: item.name,
      sku: item.sku || '',
      description: item.description || '',
      price: String(item.price),
      selectedOfferId: matchedOfferId,
      offerType: item.offerType || (item.flatAmount ? 'FLAT' : 'PERCENTAGE'),
      offerPercentage: item.offerPercentage || 0,
      flatAmount: item.flatAmount || 0,
      category: item.category || 'Cake Item',
    });
    setImage(null);
    setPreviewUrl(item.image ? (item.image.startsWith('http') ? item.image : `${url}/images/${item.image}`) : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!editingItem && !image) {
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
    if (formData.sku) bodyFormData.append('sku', formData.sku.trim());
    bodyFormData.append('description', formData.description);
    bodyFormData.append('price', Number(formData.price));
    bodyFormData.append('offerType', formData.offerType || 'PERCENTAGE');
    bodyFormData.append('offerPercentage', Number(formData.offerPercentage || 0));
    bodyFormData.append('flatAmount', Number(formData.flatAmount || 0));
    bodyFormData.append('category', formData.category);
    if (image) {
      bodyFormData.append('image', image);
    }

    try {
      let response;
      if (editingItem) {
        response = await axios.put(`${url}/api/items/${editingItem._id}`, bodyFormData);
      } else {
        response = await axios.post(`${url}/api/items`, bodyFormData);
      }

      if (response.data && response.data.success) {
        toast.success(editingItem ? '✏️ Product updated successfully!' : '🎉 Product created successfully!');
        setIsModalOpen(false);
        resetForm();
        fetchList();
      } else {
        toast.error(response.data?.message || 'Error saving product');
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
    const q = search.toLowerCase();
    const itemSku = (item.sku || '').toLowerCase();
    const itemId = (item._id || item.id || '').toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || itemSku.includes(q) || itemId.includes(q);
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const allCategoryNames = Array.from(new Set(['All', ...dbCategories.map((c) => c.name), ...list.map((i) => i.category)]));

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 60,
      render: (img) => (
        <img
          src={img ? (img.startsWith('http') ? img : `${url}/images/${img}`) : 'https://placehold.co/80x80'}
          alt="product"
          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #f1f5f9' }}
        />
      ),
    },
    {
      title: 'Product Title',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ lineHeight: '1.2' }}>
          <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{name}</strong>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
            {record.description}
          </p>
        </div>
      ),
    },
    {
      title: 'SKU Code',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku, record) => (
        <Tag color="purple" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
          {sku || `SKU-${record._id?.slice(-6).toUpperCase()}`}
        </Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="rose" style={{ fontWeight: 800, margin: 0 }}>{cat}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => {
        const hasOffer = record.offerPercentage && record.offerPercentage > 0;
        const offerPrice = record.offerPrice || (hasOffer ? Math.round(price * (1 - record.offerPercentage / 100)) : price);
        return (
          <div style={{ lineHeight: '1.2' }}>
            {hasOffer ? (
              <div>
                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '11px', display: 'block' }}>₹{price}</span>
                <strong style={{ fontSize: '14px', color: '#e03c78', fontWeight: 900 }}>₹{offerPrice}</strong>
                <Tag color="red" style={{ marginLeft: '4px', fontWeight: 800, fontSize: '10px' }}>{record.offerPercentage}% OFF</Tag>
              </div>
            ) : (
              <strong style={{ fontSize: '14px', color: '#0f172a', fontWeight: 900 }}>₹{price}</strong>
            )}
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        isAdmin ? (
          <Space size="small">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
              style={{ fontWeight: 700, color: '#0284c7', borderColor: '#bae6fd' }}
            >
              Edit
            </Button>
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
          </Space>
        ) : (
          <Tag style={{ color: '#94a3b8', fontSize: '11px' }}>Admin Action Only</Tag>
        ),
    },
  ];

  return (
    <div className="page-container">
      <Card style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
        <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
          {/* Search & Categories Bar with Create Product Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search products by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '320px', borderRadius: '10px' }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {allCategoryNames.map((cat) => (
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

              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '10px', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)' }}
                onClick={handleOpenCreate}
              >
                Create Product
              </Button>
            </div>
          </div>

          <Table
            size="middle"
            columns={columns}
            dataSource={filteredList}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      {/* Ant Design Create & Edit Product Modal */}
      <Modal
        centered
        title={<span style={{ fontWeight: 800, fontSize: '18px' }}>{editingItem ? '✏️ Edit Product' : '✨ Create New Product'}</span>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        footer={null}
        width={780}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleSubmit} style={{ marginTop: '16px' }}>
          <Row gutter={[16, 16]}>
            {/* Image Upload */}
            <Col xs={24} sm={8}>
              <Form.Item label={<span style={{ fontWeight: 800 }}>Product Image {editingItem ? '(Optional)' : '*'}</span>}>
                <Upload.Dragger
                  beforeUpload={handleImageChange}
                  showUploadList={false}
                  accept="image/*"
                  style={{ borderRadius: '12px', background: '#f8fafc', padding: '16px' }}
                >
                  {previewUrl ? (
                    <div>
                      <img src={previewUrl} alt="Preview" style={{ maxHeight: '120px', borderRadius: '8px', margin: '0 auto 6px', objectFit: 'cover' }} />
                      <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>Click or drag to change image</p>
                    </div>
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
              <Row gutter={12}>
                <Col xs={14}>
                  <Form.Item label={<span style={{ fontWeight: 800 }}>Product Title *</span>}>
                    <Input
                      size="large"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Royal Belgian Truffle Cake"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={10}>
                  <Form.Item label={<span style={{ fontWeight: 800 }}>Product SKU ID</span>}>
                    <Input
                      size="large"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                      placeholder="e.g. SKU-TRUFFLE-101"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={8}>
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

                <Col xs={8}>
                  <Form.Item label={<span style={{ fontWeight: 800 }}>Offer / Discount</span>}>
                    <Select
                      size="large"
                      value={formData.selectedOfferId || 'NONE'}
                      onChange={handleOfferSelect}
                      popupMatchSelectWidth={false}
                      style={{ borderRadius: '10px', width: '100%' }}
                    >
                      <Select.Option value="NONE">
                        <span style={{ color: '#64748b', fontWeight: 600 }}>No Offer (None)</span>
                      </Select.Option>
                      {dbOffers.map((off) => (
                        <Select.Option key={off._id} value={off._id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                            <Tag color={off.badgeColor || '#e03c78'} style={{ borderRadius: '10px', fontWeight: 800, margin: 0 }}>
                              {off.code || (off.offerType === 'FLAT' ? `FLAT ₹${off.flatAmount} OFF` : `${off.offerPercentage}% OFF`)}
                            </Tag>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{off.title}</span>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={8}>
                  <Form.Item label={<span style={{ fontWeight: 800 }}>Category *</span>}>
                    <Select
                      size="large"
                      value={formData.category}
                      onChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
                      popupMatchSelectWidth={false}
                      style={{ borderRadius: '10px', width: '100%' }}
                    >
                      {allCategoryNames.filter((c) => c !== 'All').map((catName) => (
                        <Select.Option key={catName} value={catName}>
                          {catName}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              style={{ borderRadius: '8px', fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              style={{ backgroundColor: '#f43f5e', borderRadius: '8px', fontWeight: 800, padding: '0 24px' }}
            >
              {editingItem ? 'Save Product Changes' : 'Publish Item'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default List;
