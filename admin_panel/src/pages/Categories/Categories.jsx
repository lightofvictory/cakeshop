import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Form, Input, Button, Popconfirm, Modal, Row, Col, Upload } from 'antd';
import { TagsOutlined, PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';

const emojis = ['🎂', '🍿', '🍨', '🥗', '🌿', '🍝', '🍪', '🍩', '☕', '🍕', '🍔', '🍦'];

const Categories = () => {
  const url = 'http://localhost:3000';
  const [categories, setCategories] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState('🎂');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState(null);

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

  const handleImageChange = (file) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    return false;
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedEmoji('🎂');
    setImageFile(null);
    setPreviewUrl('');
    setEditingCategory(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setSelectedEmoji(cat.icon || cat.emoji || '🎂');
    setImageFile(null);
    setPreviewUrl(cat.image ? `${url}/images/${cat.image}` : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('icon', selectedEmoji);
    formData.append('emoji', selectedEmoji);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      let res;
      if (editingCategory) {
        res = await axios.put(`${url}/api/categories/${editingCategory._id}`, formData);
      } else {
        res = await axios.post(`${url}/api/categories`, formData);
      }

      if (res.data && res.data.success) {
        toast.success(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        setIsModalOpen(false);
        resetForm();
        fetchCategories();
      } else {
        toast.error(res.data?.message || 'Error saving category');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save category');
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
      {/* Categories Grid */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '16px' }}>Active Menu Categories ({categories.length})</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#f43f5e', fontWeight: 800, borderRadius: '10px', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)' }}
              onClick={handleOpenCreate}
            >
              Add Category
            </Button>
          </div>
        }
        style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}
      >
        {categories.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '30px 0' }}>
            No custom categories added yet.
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
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {cat.image ? (
                      <img
                        src={`${url}/images/${cat.image}`}
                        alt={cat.name}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffe4e6' }}
                      />
                    ) : (
                      <span style={{ fontSize: '28px' }}>{cat.icon || cat.emoji || '🎂'}</span>
                    )}
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{cat.name}</strong>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{cat.description || 'Custom Category'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenEdit(cat)}
                      style={{ color: '#0284c7', borderColor: '#bae6fd' }}
                      title="Edit Category"
                    />
                    <Popconfirm title="Delete category?" onConfirm={() => handleDelete(cat._id)} okButtonProps={{ danger: true }}>
                      <Button danger icon={<DeleteOutlined />} size="small" title="Delete Category" />
                    </Popconfirm>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Modal Category Form (Create & Edit) */}
      <Modal
        centered
        title={<span style={{ fontWeight: 800, fontSize: '18px' }}>{editingCategory ? '✏️ Edit Category' : '✨ Add New Menu Category'}</span>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleSubmit} style={{ marginTop: '16px' }}>
          {/* Category Image Upload */}
          <Form.Item label={<span style={{ fontWeight: 800 }}>Category Icon Image (Optional)</span>}>
            <Upload.Dragger
              beforeUpload={handleImageChange}
              showUploadList={false}
              accept="image/*"
              style={{ borderRadius: '12px', background: '#f8fafc', padding: '12px' }}
            >
              {previewUrl ? (
                <div style={{ textAlign: 'center' }}>
                  <img src={previewUrl} alt="Category preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 6px', border: '2px solid #f43f5e' }} />
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Click or drag to change image</p>
                </div>
              ) : (
                <div>
                  <UploadOutlined style={{ fontSize: '24px', color: '#f43f5e' }} />
                  <p style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', margin: '4px 0 2px' }}>Upload Category Image</p>
                  <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>PNG, JPG up to 5MB</p>
                </div>
              )}
            </Upload.Dragger>
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 800 }}>Select Fallback Emoji</span>}>
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
              loading={loading}
              style={{ backgroundColor: '#f43f5e', borderRadius: '8px', fontWeight: 800, padding: '0 24px' }}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
