import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Form, Input, Button, Popconfirm, Modal, Row, Col, Tag, InputNumber, Switch, Radio } from 'antd';
import { PercentageOutlined, PlusOutlined, DeleteOutlined, EditOutlined, TagOutlined, DollarOutlined } from '@ant-design/icons';

const colorPresets = ['#e03c78', '#0284c7', '#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const Offers = () => {
  const url = 'http://localhost:3000';
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    offerType: 'PERCENTAGE', // 'PERCENTAGE' | 'FLAT'
    offerPercentage: 20,
    flatAmount: 100,
    code: '20% OFF',
    description: '',
    badgeColor: '#e03c78',
    isActive: true,
  });

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${url}/api/offers`);
      if (res.data && res.data.success) {
        setOffers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching offers from backend');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      offerType: 'PERCENTAGE',
      offerPercentage: 20,
      flatAmount: 100,
      code: '20% OFF',
      description: '',
      badgeColor: '#e03c78',
      isActive: true,
    });
    setEditingOffer(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOffer(offer);
    const isFlat = offer.offerType === 'FLAT' || (offer.flatAmount && offer.flatAmount > 0);
    setFormData({
      title: offer.title || '',
      offerType: isFlat ? 'FLAT' : 'PERCENTAGE',
      offerPercentage: offer.offerPercentage || 20,
      flatAmount: offer.flatAmount || 100,
      code: offer.code || (isFlat ? `FLAT ₹${offer.flatAmount || 100} OFF` : `${offer.offerPercentage || 20}% OFF`),
      description: offer.description || '',
      badgeColor: offer.badgeColor || '#e03c78',
      isActive: offer.isActive !== undefined ? offer.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${url}/api/offers/${id}`);
      if (res.data && res.data.success) {
        toast.success('Offer deleted successfully!');
        fetchOffers();
      } else {
        toast.error('Failed to delete offer');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting offer');
    }
  };

  const handleTypeChange = (typeVal) => {
    setFormData((prev) => {
      const defaultCode = typeVal === 'FLAT' ? `FLAT ₹${prev.flatAmount || 100} OFF` : `${prev.offerPercentage || 20}% OFF`;
      return {
        ...prev,
        offerType: typeVal,
        code: defaultCode,
      };
    });
  };

  const handleSubmit = async () => {
    if (formData.offerType === 'PERCENTAGE' && (!formData.offerPercentage || formData.offerPercentage <= 0 || formData.offerPercentage > 100)) {
      toast.error('Please enter a valid offer percentage (1 - 100%)');
      return;
    }
    if (formData.offerType === 'FLAT' && (!formData.flatAmount || formData.flatAmount <= 0)) {
      toast.error('Please enter a valid flat discount amount in ₹');
      return;
    }

    setSubmitLoading(true);
    const defaultCode = formData.offerType === 'FLAT' ? `FLAT ₹${formData.flatAmount} OFF` : `${formData.offerPercentage}% OFF`;
    const defaultTitle = formData.offerType === 'FLAT' ? `Flat ₹${formData.flatAmount} Discount` : `${formData.offerPercentage}% Discount Offer`;

    const payload = {
      ...formData,
      code: formData.code.trim() || defaultCode,
      title: formData.title.trim() || defaultTitle,
    };

    try {
      let res;
      if (editingOffer) {
        res = await axios.put(`${url}/api/offers/${editingOffer._id}`, payload);
      } else {
        res = await axios.post(`${url}/api/offers`, payload);
      }

      if (res.data && res.data.success) {
        toast.success(editingOffer ? '✏️ Offer updated!' : '🎉 New offer created!');
        setIsModalOpen(false);
        resetForm();
        fetchOffers();
      } else {
        toast.error(res.data?.message || 'Error saving offer');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save offer');
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="page-container">
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
              <TagOutlined style={{ color: '#e03c78', marginRight: '8px' }} /> Active Discount Offers ({offers.length})
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ backgroundColor: '#e03c78', fontWeight: 800, borderRadius: '10px', boxShadow: '0 4px 14px rgba(224, 60, 120, 0.3)' }}
            >
              Add New Offer
            </Button>
          </div>
        }
        style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}
        loading={loading}
      >
        <Row gutter={[16, 16]}>
          {offers.map((offer) => {
            const isFlat = offer.offerType === 'FLAT' || (offer.flatAmount && offer.flatAmount > 0);
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={offer._id}>
                <Card
                  size="small"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #f1f5f9',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    height: '100%',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Tag
                      color={offer.badgeColor || '#e03c78'}
                      style={{
                        fontSize: '13px',
                        fontWeight: 900,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        margin: 0,
                      }}
                    >
                      {offer.code || (isFlat ? `FLAT ₹${offer.flatAmount} OFF` : `${offer.offerPercentage}% OFF`)}
                    </Tag>
                    <Tag color={offer.isActive ? 'green' : 'default'} style={{ borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>
                      {isFlat ? 'FLAT (₹)' : 'PERCENT (%)'}
                    </Tag>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                    {offer.title || (isFlat ? `Flat ₹${offer.flatAmount} OFF` : `${offer.offerPercentage}% OFF`)}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 16px', minHeight: '32px' }}>
                    {offer.description || (isFlat ? `Flat ₹${offer.flatAmount} discount applied to base price.` : `${offer.offerPercentage}% percentage discount applied.`)}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenEdit(offer)}
                      style={{ fontWeight: 700, color: '#0284c7', borderColor: '#bae6fd' }}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete this offer?"
                      onConfirm={() => handleDelete(offer._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} style={{ fontWeight: 700 }} />
                    </Popconfirm>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Create / Edit Offer Modal */}
      <Modal
        centered
        title={<span style={{ fontWeight: 800, fontSize: '18px' }}>{editingOffer ? '✏️ Edit Offer' : '✨ Add New Offer'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleSubmit} style={{ marginTop: '16px' }}>
          <Form.Item label={<span style={{ fontWeight: 800 }}>Select Offer Type *</span>}>
            <Radio.Group
              value={formData.offerType}
              onChange={(e) => handleTypeChange(e.target.value)}
              buttonStyle="solid"
              size="large"
              style={{ width: '100%', display: 'flex' }}
            >
              <Radio.Button value="PERCENTAGE" style={{ flex: 1, textAlign: 'center', fontWeight: 800 }}>
                <PercentageOutlined /> Percentage (%)
              </Radio.Button>
              <Radio.Button value="FLAT" style={{ flex: 1, textAlign: 'center', fontWeight: 800 }}>
                <DollarOutlined /> Flat Amount (₹)
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              {formData.offerType === 'PERCENTAGE' ? (
                <Form.Item label={<span style={{ fontWeight: 800 }}>Offer Percentage (%) *</span>}>
                  <InputNumber
                    size="large"
                    min={1}
                    max={100}
                    style={{ width: '100%', borderRadius: '10px' }}
                    value={formData.offerPercentage}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        offerPercentage: val,
                        code: prev.code.includes('%') ? `${val}% OFF` : prev.code,
                      }))
                    }
                  />
                </Form.Item>
              ) : (
                <Form.Item label={<span style={{ fontWeight: 800 }}>Flat Discount Amount (₹) *</span>}>
                  <InputNumber
                    size="large"
                    min={1}
                    style={{ width: '100%', borderRadius: '10px' }}
                    value={formData.flatAmount}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        flatAmount: val,
                        code: prev.code.includes('FLAT') ? `FLAT ₹${val} OFF` : prev.code,
                      }))
                    }
                  />
                </Form.Item>
              )}
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ fontWeight: 800 }}>Offer Badge Code *</span>}>
                <Input
                  size="large"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder={formData.offerType === 'FLAT' ? 'e.g. FLAT ₹100 OFF' : 'e.g. 20% OFF'}
                  style={{ borderRadius: '10px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={<span style={{ fontWeight: 800 }}>Offer Title</span>}>
            <Input
              size="large"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder={formData.offerType === 'FLAT' ? 'e.g. Flat ₹100 Instant Discount' : 'e.g. Super Saver 20% Festival Offer'}
              style={{ borderRadius: '10px' }}
            />
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 800 }}>Description</span>}>
            <Input.TextArea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief offer description..."
              style={{ borderRadius: '10px' }}
            />
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 800 }}>Badge Theme Color</span>}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {colorPresets.map((c) => (
                <div
                  key={c}
                  onClick={() => setFormData((prev) => ({ ...prev, badgeColor: c }))}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    cursor: 'pointer',
                    border: formData.badgeColor === c ? '3px solid #0f172a' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 800 }}>Status</span>}>
            <Switch
              checked={formData.isActive}
              onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              checkedChildren="Active"
              unCheckedChildren="Disabled"
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: '10px', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              style={{ backgroundColor: '#e03c78', borderRadius: '10px', fontWeight: 800 }}
            >
              {editingOffer ? 'Save Changes' : 'Create Offer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Offers;
