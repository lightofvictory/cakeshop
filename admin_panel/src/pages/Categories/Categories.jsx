import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Form, Input, Button, Tag, Popconfirm, Modal, Row, Col } from 'antd';
import { TagsOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const emojis = ['🎂', '🍿', '🍨', '🥗', '🌿', '🍝', '🍪', '🍩', '☕', '🍕', '🍔', '🍦'];

const Categories = () => {
  const url = 'http://localhost:3000';
  const [categories, setCategories] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState('🎂');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${url}/api/categories`);
      if (res.data && res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${url}/api/categories`, {
        name,
        description,
        icon: selectedEmoji,
      });
      if (res.data && res.data.success) {
        toast.success('Category created successfully!');
        setName('');
        setDescription('');
        setIsModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      toast.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${url}/api/categories/${id}`);
      if (res.data && res.data.success) {
        toast.success('Category deleted!');
        fetchCategories();
      }
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="page-header-card">
        <div className="header-info">
          <span className="badge-pill">
            <TagsOutlined /> Dynamic Categories
          </span>
          <h2>Manage Shop Categories</h2>
          <p>Control menu category options served to Frontend customer view.</p>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '12px', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)' }}
          onClick={() => setIsModalOpen(true)}
        >
          + Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <Card title={<span style={{ fontWeight: 800 }}>Active Menu Categories ({categories.length})</span>} style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
        {categories.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '30px 0' }}>
            No custom categories added yet. Default categories active on Frontend.
          </p>
        ) : (
          <Row gutter={[16, 16]}>
            {categories.map((cat) => (
              <Col xs={24} sm={12} md={8} lg={6} key={cat._id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{cat.icon || '🎂'}</span>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{cat.name}</strong>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{cat.description || 'Custom Category'}</p>
                    </div>
                  </div>

                  <Popconfirm title="Delete category?" onConfirm={() => handleDelete(cat._id)} okButtonProps={{ danger: true }}>
                    <Button danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Modal Category Form */}
      <Modal
        title={<span style={{ fontWeight: 800, fontSize: '18px' }}>Add New Menu Category</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleCreate} style={{ marginTop: '16px' }}>
          <Form.Item label={<span style={{ fontWeight: 800 }}>Select Category Emoji</span>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    fontSize: '20px',
                    border: selectedEmoji === emoji ? '2px solid #f43f5e' : '1px solid #e2e8f0',
                    backgroundColor: selectedEmoji === emoji ? '#fff1f2' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 800 }}>Category Name *</span>}>
            <Input
              size="large"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milkshakes Item"
              style={{ borderRadius: '10px' }}
            />
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 800 }}>Description</span>}>
            <Input.TextArea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Thick gourmet milkshakes and smoothies"
              style={{ borderRadius: '10px' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: '8px', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: '#f43f5e', borderRadius: '8px', fontWeight: 800, padding: '0 24px' }}
            >
              Create Category
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
