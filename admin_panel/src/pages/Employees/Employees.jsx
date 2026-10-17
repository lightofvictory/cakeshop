import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Card,
  Table,
  Button,
  Tag,
  Input,
  Modal,
  Form,
  Select,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Avatar,
  Space,
} from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';

const API_URL = 'http://localhost:3000/api/employees';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      if (res.data && res.data.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      toast.error('Failed to load employees list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'ACTIVE',
      designation: 'Head Pastry Chef',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      salary: employee.salary,
      status: employee.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingEmployee) {
        const res = await axios.put(`${API_URL}/${editingEmployee._id}`, values);
        if (res.data && res.data.success) {
          toast.success('Employee updated successfully');
          setIsModalOpen(false);
          fetchEmployees();
        } else {
          toast.error(res.data.message || 'Update failed');
        }
      } else {
        const res = await axios.post(API_URL, values);
        if (res.data && res.data.success) {
          toast.success('Employee created successfully');
          setIsModalOpen(false);
          fetchEmployees();
        } else {
          toast.error(res.data.message || 'Creation failed');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/${id}`);
      if (res.data && res.data.success) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } else {
        toast.error(res.data.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Failed to delete employee');
    }
  };

  // Filtered List
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.phone?.includes(search) ||
      emp.designation?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalStaff = employees.length;
  const activeStaff = employees.filter((e) => e.status === 'ACTIVE').length;
  const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space size="middle">
          <Avatar
            size={38}
            style={{ backgroundColor: '#ffe4e6', color: '#f43f5e', fontWeight: 800 }}
          >
            {name ? name.charAt(0).toUpperCase() : 'E'}
          </Avatar>
          <div>
            <p style={{ fontWeight: 800, margin: 0, color: '#0f172a' }}>{name}</p>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
              <MailOutlined style={{ marginRight: '4px' }} />
              {record.email}
            </p>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
          <PhoneOutlined style={{ marginRight: '4px', color: '#f43f5e' }} />
          {phone || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'designation',
      key: 'designation',
      render: (designation) => (
        <Tag color="rose" style={{ fontWeight: 800, borderRadius: '12px', padding: '2px 10px' }}>
          {designation || 'Staff Member'}
        </Tag>
      ),
    },
    {
      title: 'Monthly Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => <strong style={{ color: '#0f172a', fontWeight: 800 }}>₹{salary || 0}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'} style={{ fontWeight: 800, borderRadius: '20px' }}>
          {status || 'ACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            style={{ fontWeight: 700, borderRadius: '8px' }}
            onClick={() => handleOpenEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Employee?"
            description="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small" style={{ fontWeight: 700, borderRadius: '8px' }}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Clean Header */}
      <div className="page-header-card" style={{ marginBottom: '20px' }}>
        <div className="header-info">
          <h2>Employee Staff Management</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Manage staff members, roles, and salaries.</p>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<UserAddOutlined />}
          style={{
            backgroundColor: '#f43f5e',
            fontWeight: 800,
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)',
          }}
          onClick={handleOpenAddModal}
        >
          + Add Employee
        </Button>
      </div>

      {/* KPI Cards Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={8}>
          <Card hoverable styles={{ body: { padding: '16px' } }} style={{ borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Total Staff</span>}
              value={totalStaff}
              prefix={<TeamOutlined style={{ color: '#f43f5e', marginRight: '8px' }} />}
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card hoverable styles={{ body: { padding: '16px' } }} style={{ borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Active Staff</span>}
              value={activeStaff}
              prefix={<CheckCircleOutlined style={{ color: '#10b981', marginRight: '8px' }} />}
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card hoverable styles={{ body: { padding: '16px' } }} style={{ borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <Statistic
              title={<span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Total Monthly Payroll</span>}
              value={totalPayroll}
              prefix={<span style={{ color: '#9333ea', fontWeight: 900, marginRight: '6px' }}>₹</span>}
              styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card style={{ borderRadius: '14px', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '300px', borderRadius: '8px' }}
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: '150px' }}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Add / Edit Employee Modal */}
      <Modal
        title={<span style={{ fontWeight: 800 }}>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ marginTop: '12px' }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Full Name" name="name" rules={[{ required: true, message: 'Please enter name' }]}>
                <Input placeholder="John Doe" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Enter valid email' },
                ]}
              >
                <Input placeholder="john@example.com" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Password" name="password" rules={editingEmployee ? [] : [{ required: true, message: 'Please set password' }]}>
                <Input.Password placeholder={editingEmployee ? 'Leave empty to keep' : '••••••••'} style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone Number" name="phone">
                <Input placeholder="+91 9876543210" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Role / Designation" name="designation" rules={[{ required: true, message: 'Select role' }]}>
                <Select style={{ borderRadius: '8px' }}>
                  <Select.Option value="Head Pastry Chef">Head Pastry Chef</Select.Option>
                  <Select.Option value="Assistant Baker">Assistant Baker</Select.Option>
                  <Select.Option value="POS Cashier">POS Cashier</Select.Option>
                  <Select.Option value="Inventory Manager">Inventory Manager</Select.Option>
                  <Select.Option value="Delivery Executive">Delivery Executive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Monthly Salary (₹)" name="salary" rules={[{ required: true, message: 'Enter salary' }]}>
                <Input type="number" placeholder="25000" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Status" name="status">
            <Select style={{ borderRadius: '8px' }}>
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="INACTIVE">INACTIVE</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px' }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: '8px', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{
                fontWeight: 800,
                backgroundColor: '#f43f5e',
                borderRadius: '8px',
              }}
            >
              {editingEmployee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;
