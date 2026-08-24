import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useCart } from '../../context/CartContext';
import { PlusOutlined, DeleteOutlined, PhoneOutlined, LinkOutlined, HomeOutlined } from '@ant-design/icons';
import './Auth.scss';

const Profile = () => {
  const { signOut, user } = useAuth();
  const { getCustomerOrders } = useOrders();
  const { savedAddresses, addAddress, removeAddress } = useCart();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  return (
    <main className="profile-page">
      <header>
        <p className="auth-kicker">My account</p>
        <h1>Hello, {user.name}.</h1>
        <p>Manage your Mr. Pastry details, saved delivery addresses, and orders.</p>
      </header>

      <div className="profile-grid">
        {/* Profile Details */}
        <section className="profile-card">
          <h2>Profile Details</h2>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
          <Link to="/contact" className="account-action">Need a custom cake? Contact us</Link>
        </section>

        {/* Order History Summary */}
        <section className="profile-card">
          <h2>Orders</h2>
          <p>{orderCount ? `You have ${orderCount} order${orderCount > 1 ? 's' : ''} saved to your account.` : 'You have no orders yet. Your next celebration starts with something delicious.'}</p>
          <Link to="/orders" className="account-action">View my orders</Link>
        </section>

        {/* Saved Addresses Section */}
        <section className="profile-card full-width-card">
          <div className="card-header-flex">
            <h2>Saved Delivery Addresses</h2>
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
              <p className="no-address-msg">No saved addresses yet. Add your address for faster delivery checkout!</p>
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
                    placeholder="90210" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000" 
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

      <button className="sign-out" onClick={signOut}>Sign out</button>
    </main>
  );
};

export default Profile;
