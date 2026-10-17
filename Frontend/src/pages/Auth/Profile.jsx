import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useCart } from '../../context/CartContext';
import Msg91PhoneVerify from '../../Components/Msg91PhoneVerify/Msg91PhoneVerify';
import { Tag } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  PhoneOutlined,
  LinkOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  MailOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  RightOutlined
} from '@ant-design/icons';
import './Auth.scss';

const Profile = () => {
  const { signOut, user, updateUserProfile } = useAuth();
  const { getCustomerOrders } = useOrders();
  const { savedAddresses, addAddress, removeAddress } = useCart();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Home',
    addressLine: '',
    state: '',
    country: 'United States',
    pincode: '',
    phone: '',
    locationLink: ''
  });

  if (!user) return <Navigate to="/signin" replace />;
  const orderCount = getCustomerOrders(user.email).length;

  const handleSubmitAddress = (e) => {
    e.preventDefault();
    if (!formData.addressLine || !formData.state || !formData.pincode || !formData.phone) {
      alert('Please fill in Address Line, State, Pincode, and Phone Number.');
      return;
    }
    addAddress(formData);
    setFormData({
      title: 'Home',
      addressLine: '',
      state: '',
      country: 'United States',
      pincode: '',
      phone: '',
      locationLink: ''
    });
    setIsAddModalOpen(false);
  };

  const firstInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <main className="profile-page">
      <div className="profile-container">
        {/* Top Header Card */}
        <header className="profile-header-banner">
          <div className="header-left-group">
            <div className="user-avatar-circle">
              <span>{firstInitial}</span>
            </div>
            <div className="user-header-text">
              <span className="profile-welcome-tag">My Account Dashboard</span>
              <h1>Hello, {user.name} 👋</h1>
              <p>Manage your account details, delivery addresses, and orders in one place.</p>
            </div>
          </div>

          <button type="button" className="btn-signout-header" onClick={signOut}>
            <LogoutOutlined /> <span>Sign Out</span>
          </button>
        </header>

        {/* Dashboard Grid */}
        <div className="profile-grid">
          {/* Profile Details Card */}
          <section className="profile-card">
            <div className="profile-card-header">
              <UserOutlined className="card-header-icon" />
              <h2>Profile Details</h2>
            </div>

            <div className="profile-details-list">
              <div className="detail-item">
                <span className="detail-label"><UserOutlined /> Full Name</span>
                <span className="detail-value">{user.name}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label"><MailOutlined /> Email Address</span>
                <span className="detail-value">{user.email}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label"><PhoneOutlined /> Mobile Number</span>
                <div className="detail-phone-row">
                  <span className="detail-value">{user.phoneNumber || user.phone || 'Not verified'}</span>
                  {user.phoneVerified ? (
                    <Tag color="green" className="status-tag verified">
                      <CheckCircleOutlined /> Verified
                    </Tag>
                  ) : (
                    <Tag color="orange" className="status-tag unverified">
                      Unverified
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            {!user.phoneVerified ? (
              <button
                type="button"
                className="btn-verify-msg91"
                onClick={() => setIsVerifyModalOpen(true)}
              >
                <SafetyCertificateOutlined /> <span>Verify Mobile via MSG91 OTP</span>
              </button>
            ) : (
              <p className="verified-success-text">
                ✓ Verified on {user.phoneVerifiedAt ? new Date(user.phoneVerifiedAt).toLocaleDateString() : 'MSG91 SMS'}
              </p>
            )}

            <Link to="/contact" className="account-action-link">
              Need a custom cake? Contact us <RightOutlined />
            </Link>
          </section>

          {/* Orders Card */}
          <section className="profile-card">
            <div className="profile-card-header">
              <ShoppingOutlined className="card-header-icon" />
              <h2>Orders History</h2>
            </div>

            <div className="orders-summary-box">
              <span className="order-count-number">{orderCount}</span>
              <p className="orders-summary-desc">
                {orderCount
                  ? `You have ${orderCount} order${orderCount > 1 ? 's' : ''} saved in your account history.`
                  : 'You have no orders yet. Your next celebration starts with something delicious!'}
              </p>
            </div>

            <Link to="/orders" className="btn-view-orders">
              <span>View My Orders</span> <RightOutlined />
            </Link>
          </section>

          {/* Saved Addresses Card */}
          <section className="profile-card full-width-card">
            <div className="card-header-flex">
              <div className="profile-card-header">
                <HomeOutlined className="card-header-icon" />
                <h2>Saved Delivery Addresses</h2>
              </div>

              <button type="button" className="add-address-btn" onClick={() => setIsAddModalOpen(true)}>
                <PlusOutlined /> Add New Address
              </button>
            </div>

            <div className="address-list-grid">
              {savedAddresses && savedAddresses.length > 0 ? (
                savedAddresses.map((addr) => (
                  <div key={addr.id} className="address-box">
                    <div className="box-top">
                      <span className="address-tag"><HomeOutlined /> {addr.title || 'Address'}</span>
                      <button type="button" className="delete-addr-btn" onClick={() => removeAddress(addr.id)} title="Delete address">
                        <DeleteOutlined />
                      </button>
                    </div>
                    <p className="address-text">{addr.addressLine}</p>
                    <p className="address-sub">{addr.state}, {addr.country} - {addr.pincode}</p>
                    <p className="address-phone"><PhoneOutlined /> {addr.phone}</p>
                    {addr.locationLink && (
                      <a href={addr.locationLink} target="_blank" rel="noopener noreferrer" className="location-link">
                        <LinkOutlined /> Location Map Link
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-address-box">
                  <HomeOutlined className="no-address-icon" />
                  <p className="no-address-msg">No saved addresses yet. Add your address for faster delivery checkout!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Add Address Modal */}
        {isAddModalOpen && (
          <div className="address-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
            <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add New Delivery Address</h3>
              <form onSubmit={handleSubmitAddress}>
                <div className="form-group">
                  <label>Address Label (e.g. Home, Work)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Home"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address Line</label>
                  <input
                    type="text"
                    value={formData.addressLine}
                    onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                    placeholder="Street name, building, apartment number"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State / Region"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Country"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode / Zip Code</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="400001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Location Link (Optional Google Maps Link)</label>
                  <input
                    type="url"
                    value={formData.locationLink}
                    onChange={(e) => setFormData({ ...formData, locationLink: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-save">Save Address</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MSG91 Phone Verification Modal */}
        <Msg91PhoneVerify
          open={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          currentPhone={user.phoneNumber || user.phone || ''}
          onSuccess={(updatedUserData) => {
            updateUserProfile(updatedUserData);
          }}
        />
      </div>
    </main>
  );
};

export default Profile;
