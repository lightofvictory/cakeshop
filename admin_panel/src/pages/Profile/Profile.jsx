import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Card, Form, Input, Button, Tag, Row, Col, Avatar, Divider, Tabs } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  KeyOutlined,
  CheckCircleFilled,
  IdcardOutlined,
} from '@ant-design/icons';

const Profile = () => {
  const { adminUser, updateProfile } = useAuth();
  const [infoForm] = Form.useForm();
  const [passForm] = Form.useForm();
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (adminUser) {
      infoForm.setFieldsValue({
        name: adminUser.name || '',
        email: adminUser.email || '',
        phone: adminUser.phone || '',
        avatar: adminUser.avatar || '',
        bio: adminUser.bio || '',
      });
    }
  }, [adminUser, infoForm]);

  const handleUpdateInfo = async (values) => {
    setSavingInfo(true);
    const res = await updateProfile(values);
    setSavingInfo(false);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleChangePassword = async (values) => {
    setSavingPass(true);
    const res = await updateProfile({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    setSavingPass(false);

    if (res.success) {
      toast.success('Password changed successfully!');
      passForm.resetFields();
    } else {
      toast.error(res.message);
    }
  };

  const getInitial = () => {
    return adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <div className="admin-profile-page">
      {/* Header Banner */}
      <div className="profile-header-card">
        <Row align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
            <Avatar
              size={96}
              src={adminUser?.avatar || null}
              icon={!adminUser?.avatar ? getInitial() : null}
              style={{
                backgroundColor: '#ffe4e6',
                color: '#f43f5e',
                fontSize: '36px',
                fontWeight: 800,
                border: '4px solid #ffffff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              }}
            >
              {!adminUser?.avatar && getInitial()}
            </Avatar>
          </Col>
          <Col xs={24} sm={18} md={20}>
            <div className="profile-header-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                  {adminUser?.name || 'Admin User'}
                </h1>
                <Tag
                  color="rose"
                  style={{
                    backgroundColor: '#ffe4e6',
                    color: '#f43f5e',
                    border: 'none',
                    fontWeight: 800,
                    borderRadius: '20px',
                    padding: '2px 10px',
                  }}
                >
                  {(adminUser?.role || 'admin').toUpperCase()}
                </Tag>
                <Tag
                  icon={<CheckCircleFilled style={{ color: '#10b981' }} />}
                  style={{ borderRadius: '20px', padding: '2px 10px' }}
                >
                  Verified Account
                </Tag>
              </div>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
                <MailOutlined style={{ marginRight: '6px' }} />
                {adminUser?.email || 'admin@mrpastry.com'}
              </p>
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {/* Left Column: Summary Card */}
        <Col xs={24} lg={8}>
          <Card title="Account Details" className="profile-summary-card" extra={<IdcardOutlined />}>
            <div className="summary-item">
              <span className="label">Full Name:</span>
              <span className="value">{adminUser?.name || 'N/A'}</span>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div className="summary-item">
              <span className="label">Email Address:</span>
              <span className="value">{adminUser?.email || 'N/A'}</span>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div className="summary-item">
              <span className="label">Phone Number:</span>
              <span className="value">{adminUser?.phone || 'Not set'}</span>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div className="summary-item">
              <span className="label">Role & Access:</span>
              <span className="value" style={{ textTransform: 'capitalize' }}>
                {adminUser?.role || 'Admin'} (Full Access)
              </span>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div className="summary-item">
              <span className="label">Bio / Note:</span>
              <span className="value">{adminUser?.bio || 'No bio provided.'}</span>
            </div>
          </Card>
        </Col>

        {/* Right Column: Settings & Password Tabs */}
        <Col xs={24} lg={16}>
          <Card className="profile-edit-card">
            <Tabs
              defaultActiveKey="general"
              items={[
                {
                  key: 'general',
                  label: (
                    <span style={{ fontWeight: 600 }}>
                      <EditOutlined /> Edit Profile
                    </span>
                  ),
                  children: (
                    <Form
                      form={infoForm}
                      layout="vertical"
                      onFinish={handleUpdateInfo}
                      size="large"
                      style={{ marginTop: '16px' }}
                    >
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter your name' }]}
                          >
                            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label="Email Address"
                            name="email"
                            rules={[
                              { required: true, message: 'Please enter your email' },
                              { type: 'email', message: 'Valid email required' },
                            ]}
                          >
                            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Phone Number" name="phone">
                            <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="+1 234 567 890" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Avatar Image URL" name="avatar">
                            <Input placeholder="https://example.com/avatar.jpg" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item label="Bio / Professional Tagline" name="bio">
                        <Input.TextArea rows={3} placeholder="Senior Bakery Administrator & Inventory Manager" />
                      </Form.Item>

                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={savingInfo}
                        className="auth-submit-btn"
                        style={{ width: 'auto', paddingLeft: '32px', paddingRight: '32px' }}
                      >
                        Save Profile Changes
                      </Button>
                    </Form>
                  ),
                },
                {
                  key: 'security',
                  label: (
                    <span style={{ fontWeight: 600 }}>
                      <KeyOutlined /> Change Password
                    </span>
                  ),
                  children: (
                    <Form
                      form={passForm}
                      layout="vertical"
                      onFinish={handleChangePassword}
                      size="large"
                      style={{ marginTop: '16px' }}
                    >
                      <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Please enter your current password' }]}
                      >
                        <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} />
                      </Form.Item>

                      <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                          { required: true, message: 'Please enter a new password' },
                          { min: 6, message: 'Password must be at least 6 characters' },
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} />
                      </Form.Item>

                      <Form.Item
                        label="Confirm New Password"
                        name="confirmNewPassword"
                        dependencies={['newPassword']}
                        rules={[
                          { required: true, message: 'Please confirm your new password' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Passwords do not match'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password prefix={<SafetyCertificateOutlined style={{ color: '#94a3b8' }} />} />
                      </Form.Item>

                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={savingPass}
                        className="auth-submit-btn"
                        style={{ width: 'auto', paddingLeft: '32px', paddingRight: '32px' }}
                      >
                        Update Password
                      </Button>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
