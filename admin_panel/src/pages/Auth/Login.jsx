import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Card, Form, Input, Button, Tabs, Select } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const onFinishLogin = async (values) => {
    setLoading(true);
    const result = await login(values.email, values.password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back, Admin!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const onFinishRegister = async (values) => {
    setLoading(true);
    const result = await register(values.name, values.email, values.password, values.role);
    setLoading(false);

    if (result.success) {
      toast.success(`Account registered successfully as ${values.role.toUpperCase()}!`);
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="auth-card-wrapper">
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <ShopOutlined style={{ fontSize: '28px', color: '#f43f5e' }} />
          </div>
          <h2>Mr. Pastry Admin</h2>
          <p>Bakery Management & Control Center</p>
        </div>

        <Card className="auth-card" borderless="true">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: (
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>
                    <LockOutlined /> Admin Login
                  </span>
                ),
                children: (
                  <Form
                    name="admin_login"
                    layout="vertical"
                    onFinish={onFinishLogin}
                    size="large"
                    requiredMark={false}
                  >
                    <Form.Item
                      label="Email Address"
                      name="email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="admin@mrpastry.com"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="••••••••"
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      className="auth-submit-btn"
                    >
                      Sign In to Admin Panel
                    </Button>
                  </Form>
                ),
              },
              {
                key: 'register',
                label: (
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>
                    <UserOutlined /> Admin Sign Up
                  </span>
                ),
                children: (
                  <Form
                    name="admin_register"
                    layout="vertical"
                    onFinish={onFinishRegister}
                    size="large"
                    requiredMark={false}
                  >
                    <Form.Item
                      label="Full Name"
                      name="name"
                      rules={[{ required: true, message: 'Please enter your full name' }]}
                    >
                      <Input
                        prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="Admin User"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Account Role"
                      name="role"
                      initialValue="employee"
                      rules={[{ required: true, message: 'Please select a role' }]}
                    >
                      <Select>
                        <Select.Option value="employee">Employee / Staff (Restricted Access)</Select.Option>
                        <Select.Option value="admin">Admin / Owner (Full Access)</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Email Address"
                      name="email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="admin@mrpastry.com"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[
                        { required: true, message: 'Please enter a password' },
                        { min: 6, message: 'Password must be at least 6 characters' },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="••••••••"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Confirm Password"
                      name="confirmPassword"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Please confirm your password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<SafetyCertificateOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="••••••••"
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      className="auth-submit-btn"
                    >
                      Create Admin Account
                    </Button>
                  </Form>
                ),
              },
            ]}
          />
        </Card>

        <div className="auth-footer">
          <p>© {new Date().getFullYear()} Mr. Pastry Bakery System. Secured Access Only.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
