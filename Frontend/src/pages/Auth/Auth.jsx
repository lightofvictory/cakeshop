import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { DatePicker, Modal } from 'antd';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { assets } from '../../assets/assets';
import {
  MobileOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SendOutlined,
  UserOutlined,
  LockOutlined,
  RightOutlined,
  PhoneOutlined,
  ExclamationCircleFilled,
  RightCircleOutlined,
  GoogleOutlined,
  FacebookFilled,
  TwitterOutlined,
  TruckOutlined,
  CoffeeOutlined,
  ShopOutlined,
  CheckOutlined,
  MessageOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import './Auth.scss';

export const SignIn = ({ isModalMode, onSuccess }) => {
  const { sendLoginOtp, verifyLoginOtp, resendOtp, loginWithGoogle, user } = useAuth();
  const { settings } = useSettings();
  const shopName = settings?.shopName || 'Mr. Pastry';
  const navigate = useNavigate();

  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
  const [contactValue, setContactValue] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Sign-In Modal & Custom Input State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('alex.pastry@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('Alex Morgan');

  const handleGoogleSignInSubmit = async (email, name) => {
    const targetEmail = email || googleEmailInput;
    const targetName = name || googleNameInput || targetEmail.split('@')[0];

    setLoading(true);
    const res = await loginWithGoogle({
      email: targetEmail,
      name: targetName,
    });
    setLoading(false);

    if (res.success) {
      setIsGoogleModalOpen(false);
      if (isModalMode && onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    }
  };

  // 60-Second Resend Cooldown Timer
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    let timer;
    if (otpSent && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, cooldown]);

  if (user) return <Navigate to="/profile" replace />;

  const maskContact = (str) => {
    if (!str) return '';
    if (str.includes('@')) {
      const [name, domain] = str.split('@');
      return `${name.slice(0, 2)}***@${domain}`;
    }
    return `${str.slice(0, 3)} ****** ${str.slice(-4)}`;
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMethod === 'phone' && contactValue.trim().length < 8) {
      setErrorMsg('Please enter a valid mobile number (+91 9876543210)');
      return;
    }

    if (authMethod === 'email' && (!contactValue.includes('@') || !contactValue.includes('.'))) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const res = await sendLoginOtp({
      phone: authMethod === 'phone' ? contactValue.trim() : '',
      email: authMethod === 'email' ? contactValue.trim() : '',
    });
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setCooldown(60);
      setEnteredOtp('');
    } else {
      setErrorMsg(res.message || "We couldn't find an account with this contact. Please Create an Account.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!enteredOtp || enteredOtp.trim().length < 4) {
      setErrorMsg('Please enter the OTP verification code');
      return;
    }

    setLoading(true);
    const result = await verifyLoginOtp({
      phone: authMethod === 'phone' ? contactValue.trim() : '',
      email: authMethod === 'email' ? contactValue.trim() : '',
      otp: enteredOtp.trim(),
    });
    setLoading(false);

    if (result.success) {
      if (isModalMode && onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(result.message || 'Invalid verification code');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setErrorMsg('');
    setLoading(true);
    const res = await resendOtp({
      phone: authMethod === 'phone' ? contactValue.trim() : '',
      email: authMethod === 'email' ? contactValue.trim() : '',
      purpose: 'LOGIN',
    });
    setLoading(false);
    if (res.success) {
      setCooldown(60);
      setEnteredOtp('');
    } else {
      setErrorMsg(res.message || 'Failed to resend OTP');
    }
  };

  return (
    <AuthLayout
      isModalMode={isModalMode}
      currentView="signin"
      bannerTitle={`Welcome to ${shopName}`}
      bannerSubtitle="Discover trending cakes, shop smarter, and enjoy seamless online ordering with fast delivery."
    >
      <div className="auth-form-header">
        <h2 className="form-main-title">Sign in</h2>
        <p className="form-main-subtitle">Access your account to manage orders and rewards.</p>
      </div>

      {errorMsg && (
        <div className="auth-alert-error-card">
          <ExclamationCircleFilled className="alert-icon" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!otpSent ? (
        <form onSubmit={handleRequestOtp} className="auth-form-body">
          {/* Method Pills */}
          <div className="auth-method-pills-row">
            <button
              type="button"
              className={`method-pill-btn ${authMethod === 'phone' ? 'active' : ''}`}
              onClick={() => {
                setAuthMethod('phone');
                setErrorMsg('');
              }}
            >
              <MobileOutlined /> Mobile OTP
            </button>
            <button
              type="button"
              className={`method-pill-btn ${authMethod === 'email' ? 'active' : ''}`}
              onClick={() => {
                setAuthMethod('email');
                setErrorMsg('');
              }}
            >
              <MailOutlined /> Email OTP
            </button>
          </div>

          <div className="auth-or-line">
            <span>OR SIGN IN WITH {authMethod === 'phone' ? 'MOBILE' : 'EMAIL'}</span>
          </div>

          {/* Contact Input */}
          <div className="form-field-item">
            <label className="field-label">{authMethod === 'phone' ? 'MOBILE NUMBER' : 'EMAIL ADDRESS'}</label>
            <div className="input-with-icon">
              <span className="field-icon">{authMethod === 'phone' ? <PhoneOutlined /> : <MailOutlined />}</span>
              <input
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                type={authMethod === 'phone' ? 'tel' : 'email'}
                placeholder={authMethod === 'phone' ? 'Enter mobile number' : 'Enter your email'}
                required
                autoFocus
              />
              {contactValue.trim().length >= 8 && <CheckCircleOutlined className="input-valid-icon" />}
            </div>
          </div>

          {/* Optional Password */}
          <div className="form-field-item">
            <label className="field-label">PASSWORD (OPTIONAL)</label>
            <div className="input-with-icon">
              <span className="field-icon"><LockOutlined /></span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Checkbox Row */}
          <div className="form-row-checkbox">
            <label className="custom-checkbox-label">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Remember Me</span>
            </label>
          </div>

          {/* Primary Action Button */}
          <button type="submit" disabled={loading} className="btn-action-primary">
            {loading ? 'CHECKING ACCOUNT...' : 'SIGN IN NOW'}
          </button>

          {/* Google Sign-In Divider & Button */}
          <div className="auth-social-divider">
            <span>OR CONTINUE WITH GOOGLE</span>
          </div>

          <button
            type="button"
            className="btn-google-signin"
            onClick={() => setIsGoogleModalOpen(true)}
          >
            <svg className="google-svg-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google Account</span>
          </button>

          {!isModalMode && (
            <div className="auth-footer-toggle-text">
              Don't have an account? <Link to="/signup">Create Account</Link>
            </div>
          )}
        </form>
      ) : (
        /* OTP Verification Screen */
        <form onSubmit={handleVerifyOtp} className="auth-form-body">
          <div className="otp-sent-info-card">
            <CheckCircleOutlined style={{ fontSize: '2.2rem', color: '#10b981' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1.4rem' }}>
                Verify Your {authMethod === 'phone' ? 'Mobile Number' : 'Email'}
              </p>
              <small style={{ color: '#64748b', fontSize: '1.2rem' }}>
                Sent code to: <strong>{maskContact(contactValue)}</strong>
              </small>
            </div>
          </div>

          <div className="form-field-item">
            <label className="field-label">ENTER 6-DIGIT OTP CODE</label>
            <div className="input-with-icon">
              <span className="field-icon"><SafetyCertificateOutlined /></span>
              <input
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                type="text"
                placeholder="123456"
                maxLength={6}
                required
                autoFocus
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-action-primary">
            {loading ? 'VERIFYING...' : 'VERIFY & SIGN IN'}
          </button>

          <div className="otp-actions-flex">
            <button
              type="button"
              className="btn-back"
              onClick={() => {
                setOtpSent(false);
                setEnteredOtp('');
                setErrorMsg('');
              }}
            >
              <ArrowLeftOutlined /> Change Details
            </button>

            <button type="button" className={`btn-resend ${cooldown > 0 ? 'disabled' : ''}`} disabled={cooldown > 0 || loading} onClick={handleResend}>
              {cooldown > 0 ? `Resend in 00:${cooldown < 10 ? `0${cooldown}` : cooldown}` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}
      {/* Google Account Selector Modal */}
      <Modal
        open={isGoogleModalOpen}
        onCancel={() => setIsGoogleModalOpen(false)}
        footer={null}
        centered
        width={420}
        destroyOnHidden
      >
        <div style={{ textAlign: 'center', padding: '12px 6px' }}>
          <svg viewBox="0 0 24 24" width="40" height="40" style={{ marginBottom: '12px' }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Choose a Google Account</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>to continue to {shopName}</p>

          <div 
            onClick={() => handleGoogleSignInSubmit('alex.pastry@gmail.com', 'Alex Morgan')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '10px',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
              A
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>Alex Morgan</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>alex.pastry@gmail.com</span>
            </div>
          </div>

          <div 
            onClick={() => handleGoogleSignInSubmit('sarah.bakes@gmail.com', 'Sarah Jenkins')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '18px',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#db2777', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
              S
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>Sarah Jenkins</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>sarah.bakes@gmail.com</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textAlign: 'left' }}>Or enter another Google Email:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                placeholder="your.email@gmail.com"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => handleGoogleSignInSubmit(googleEmailInput, googleNameInput)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#e02484',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
};

export const SignUp = ({ isModalMode, onSuccess }) => {
  const { sendRegisterOtp, verifyRegisterOtp, resendOtp, loginWithGoogle, user, updateOrderPreferences } = useAuth();
  const { orderPreference, updateOrderPreference, outlets } = useCart();
  const { settings } = useSettings();
  const shopName = settings?.shopName || 'Mr. Pastry';
  const navigate = useNavigate();

  // Google Sign-In Modal & Custom Input State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('alex.pastry@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('Alex Morgan');

  const handleGoogleSignInSubmit = async (email, name) => {
    const targetEmail = email || googleEmailInput;
    const targetName = name || googleNameInput || targetEmail.split('@')[0];

    setLoading(true);
    const res = await loginWithGoogle({
      email: targetEmail,
      name: targetName,
    });
    setLoading(false);

    if (res.success) {
      setIsGoogleModalOpen(false);
      if (isModalMode && onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    }
  };

  // Multi-step state: 1 = Preferences, 2 = Account Details & OTP
  const [signUpStep, setSignUpStep] = useState(1);

  // Preference State initialized from orderPreference or defaults
  const [mode, setMode] = useState(orderPreference?.mode || 'pickup');
  const [pickupBranch, setPickupBranch] = useState(orderPreference?.pickupBranch || 'Flagship Bakery - 100 Cake Avenue, Downtown');
  const [tableNumber, setTableNumber] = useState(orderPreference?.tableNumber || '');
  const [guestCount, setGuestCount] = useState(orderPreference?.guestCount || '');
  const [scheduledDateTime, setScheduledDateTime] = useState(() => {
    if (orderPreference?.utcScheduledISO) return dayjs(orderPreference.utcScheduledISO);
    return dayjs();
  });
  const [orderUpdateChannel, setOrderUpdateChannel] = useState(orderPreference?.orderUpdateChannel || 'WHATSAPP_SMS');
  const [receiptChannel, setReceiptChannel] = useState(orderPreference?.receiptChannel || 'WHATSAPP');

  // Form State
  const [authMethod, setAuthMethod] = useState('phone');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 60-Second Cooldown Timer
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    let timer;
    if (otpSent && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, cooldown]);

  if (user) return <Navigate to="/profile" replace />;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || formData.name.trim().length < 2) {
      setErrorMsg('Please enter your full name');
      return;
    }

    if (authMethod === 'phone' && (!formData.phone || formData.phone.trim().length < 8)) {
      setErrorMsg('Please enter a valid mobile number (+91 9876543210)');
      return;
    }

    if (authMethod === 'email' && (!formData.email || !formData.email.includes('@'))) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    const res = await sendRegisterOtp({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
    });
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setCooldown(60);
      setEnteredOtp('');
    } else {
      setErrorMsg(res.message || 'Failed to send registration OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!enteredOtp || enteredOtp.trim().length < 4) {
      setErrorMsg('Please enter the OTP verification code');
      return;
    }

    setLoading(true);
    const result = await verifyRegisterOtp({
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      otp: enteredOtp.trim(),
      name: formData.name.trim(),
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      if (updateOrderPreferences) {
        updateOrderPreferences({
          mode,
          pickupBranch,
          tableNumber,
          guestCount,
          dateType,
          orderUpdateChannel,
          receiptChannel
        });
      }
      if (isModalMode && onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(result.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setErrorMsg('');
    setLoading(true);
    const res = await resendOtp({
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      purpose: 'REGISTER',
    });
    setLoading(false);
    if (res.success) {
      setCooldown(60);
      setEnteredOtp('');
    } else {
      setErrorMsg(res.message || 'Failed to resend OTP');
    }
  };

  const handleSavePreferencesAndContinue = () => {
    const targetDayjs = scheduledDateTime || dayjs();
    const formattedDate = targetDayjs.format('ddd, DD MMM YYYY');
    const formattedTime = targetDayjs.format('hh:mm A');
    if (updateOrderPreference) {
      updateOrderPreference({
        mode,
        pickupBranch,
        tableNumber,
        guestCount,
        utcDateStr: targetDayjs.format('YYYY-MM-DD'),
        utcScheduledISO: targetDayjs.toISOString(),
        formattedDate,
        formattedTime,
        dateType: 'Custom',
        timeSlot: formattedTime,
        orderUpdateChannel,
        receiptChannel
      });
    }
    setSignUpStep(2);
  };

  return (
    <AuthLayout
      isModalMode={isModalMode}
      currentView="signup"
      bannerTitle={`Welcome to ${shopName}`}
      bannerSubtitle="Discover artisanal cakes, shop smarter, and enjoy a seamless online ordering experience with fast delivery."
    >
      {signUpStep === 1 ? (
        /* Step 1: Select Fulfillment & Notification Preferences */
        <div className="pref-step-content">
          <div className="pref-header">
            <span className="pref-badge">
              <SafetyCertificateOutlined /> VERIFIED ACCOUNT SETUP
            </span>
            <h2 className="pref-title">Select Fulfillment & Delivery Schedule</h2>
            <p className="pref-subtitle">
              Choose your order type and schedule.
            </p>
          </div>

          <div className="pref-sections-body">
            {/* Section 1: Fulfillment Type */}
            <div className="pref-section-group">
              <h3 className="pref-section-heading">1. SELECT FULFILLMENT TYPE (PRIMARY DECISION):</h3>
              <div className="pref-mode-cards-grid">
                <button
                  type="button"
                  className={`pref-mode-card ${mode === 'delivery' ? 'selected' : ''}`}
                  onClick={() => setMode('delivery')}
                >
                  {mode === 'delivery' && <span className="pref-check-icon"><CheckOutlined /></span>}
                  <div className="card-icon-box"><TruckOutlined /></div>
                  <strong className="card-title">🚚 Delivery</strong>
                  <span className="card-sub">Fresh doorstep delivery</span>
                </button>

                <button
                  type="button"
                  className={`pref-mode-card ${mode === 'dinein' ? 'selected' : ''}`}
                  onClick={() => setMode('dinein')}
                >
                  {mode === 'dinein' && <span className="pref-check-icon"><CheckOutlined /></span>}
                  <div className="card-icon-box"><CoffeeOutlined /></div>
                  <strong className="card-title">🍽️ Dine In</strong>
                  <span className="card-sub">Enjoy at bakery café</span>
                </button>

                <button
                  type="button"
                  className={`pref-mode-card ${mode === 'pickup' ? 'selected' : ''}`}
                  onClick={() => setMode('pickup')}
                >
                  {mode === 'pickup' && <span className="pref-check-icon"><CheckOutlined /></span>}
                  <div className="card-icon-box"><ShopOutlined /></div>
                  <strong className="card-title">🛍️ Pick Up</strong>
                  <span className="card-sub">Counter takeaway</span>
                </button>
              </div>

              {mode === 'pickup' && outlets && outlets.length > 1 && (
                <div className="pref-detail-field">
                  <label className="field-label">📍 Select Pickup Branch:</label>
                  <select
                    value={pickupBranch}
                    onChange={(e) => setPickupBranch(e.target.value)}
                    className="pref-select-dropdown"
                  >
                    {outlets.map((o, idx) => (
                      <option key={o.id || idx} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {mode === 'dinein' && (
                <div className="pref-detail-grid">
                  <div className="pref-detail-field">
                    <label className="field-label">🪑 Table Number:</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="pref-text-field"
                      placeholder="Enter Table Number (e.g. 12)"
                    />
                  </div>
                  <div className="pref-detail-field">
                    <label className="field-label">👥 Number of Guests:</label>
                    <input
                      type="number"
                      min={1}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="pref-text-field"
                      placeholder="Enter Number of Guests (e.g. 2)"
                    />
                  </div>
                </div>
              )}

              {mode !== 'dinein' && (
                <div className="pref-schedule-group">
                  <label className="field-label-center">SCHEDULE DATE & TIME:</label>
                  <DatePicker
                    showTime={{ format: 'hh:mm A', use12Hours: true }}
                    className="pref-datepicker"
                    value={scheduledDateTime}
                    onChange={(val) => val && setScheduledDateTime(val)}
                    disabledDate={(current) => current && current.endOf('day').isBefore(dayjs().startOf('day'))}
                    format="ddd, DD MMM YYYY, hh:mm A"
                    size="large"
                    style={{ width: '100%', borderRadius: '12px', marginTop: '8px' }}
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn-action-primary pref-continue-btn"
            onClick={handleSavePreferencesAndContinue}
          >
            CONTINUE TO ACCOUNT DETAILS →
          </button>
        </div>
      ) : (
        /* Step 2: User Account Registration & Verification */
        <>
          <div className="auth-form-header">
            <button
              type="button"
              className="back-to-pref-link"
              onClick={() => setSignUpStep(1)}
            >
              <ArrowLeftOutlined /> Modify Preferences
            </button>
            <h2 className="form-main-title">Sign up</h2>
            <p className="form-main-subtitle">It's free to signup and only takes a minute.</p>
          </div>

          {errorMsg && (
            <div className="auth-alert-error-card">
              <ExclamationCircleFilled className="alert-icon" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="auth-form-body">
              {/* Method Selection Row */}
              <div className="auth-method-pills-row">
                <button
                  type="button"
                  className={`method-pill-btn ${authMethod === 'phone' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMethod('phone');
                    setErrorMsg('');
                  }}
                >
                  <MobileOutlined /> Mobile OTP
                </button>
                <button
                  type="button"
                  className={`method-pill-btn ${authMethod === 'email' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMethod('email');
                    setErrorMsg('');
                  }}
                >
                  <MailOutlined /> Email Verification
                </button>
              </div>

              <div className="auth-or-line">
                <span>OR SIGN UP WITH {authMethod === 'phone' ? 'MOBILE' : 'EMAIL'}</span>
              </div>

              {/* 2-Column Grid for Input Fields on Tablet/Desktop */}
              <div className="form-fields-grid">
                <div className="form-field-item">
                  <label className="field-label">FULL NAME *</label>
                  <div className="input-with-icon">
                    <span className="field-icon"><UserOutlined /></span>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      type="text"
                      placeholder="Enter your full name"
                      required
                      autoFocus
                    />
                    {formData.name.trim().length >= 2 && <CheckCircleOutlined className="input-valid-icon" />}
                  </div>
                </div>

                {authMethod === 'phone' ? (
                  <div className="form-field-item">
                    <label className="field-label">MOBILE NUMBER *</label>
                    <div className="input-with-icon">
                      <span className="field-icon"><PhoneOutlined /></span>
                      <input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        type="tel"
                        placeholder="+91 9876543210"
                        required
                      />
                      {formData.phone.trim().length >= 8 && <CheckCircleOutlined className="input-valid-icon" />}
                    </div>
                  </div>
                ) : (
                  <div className="form-field-item">
                    <label className="field-label">EMAIL ADDRESS *</label>
                    <div className="input-with-icon">
                      <span className="field-icon"><MailOutlined /></span>
                      <input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        type="email"
                        placeholder="Enter your email"
                        required
                      />
                      {formData.email.includes('@') && <CheckCircleOutlined className="input-valid-icon" />}
                    </div>
                  </div>
                )}

                {authMethod === 'phone' && (
                  <div className="form-field-item">
                    <label className="field-label">EMAIL ADDRESS (OPTIONAL)</label>
                    <div className="input-with-icon">
                      <span className="field-icon"><MailOutlined /></span>
                      <input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        type="email"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                )}

                <div className="form-field-item">
                  <label className="field-label">PASSWORD (OPTIONAL)</label>
                  <div className="input-with-icon">
                    <span className="field-icon"><LockOutlined /></span>
                    <input
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      type="password"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                {formData.password && (
                  <div className="form-field-item">
                    <label className="field-label">CONFIRM PASSWORD *</label>
                    <div className="input-with-icon">
                      <span className="field-icon"><LockOutlined /></span>
                      <input
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        type="password"
                        placeholder="Confirm password"
                        required
                      />
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <CheckCircleOutlined className="input-valid-icon" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="form-row-checkbox">
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                  />
                  <span>I have read and agree to the <strong>terms and conditions</strong></span>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="btn-action-primary">
                {loading ? 'SENDING OTP...' : 'REGISTER NOW'}
              </button>

              {/* Google Sign-In Divider & Button */}
              <div className="auth-social-divider">
                <span>OR CONTINUE WITH GOOGLE</span>
              </div>

              <button
                type="button"
                className="btn-google-signin"
                onClick={() => setIsGoogleModalOpen(true)}
              >
                <svg className="google-svg-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google Account</span>
              </button>

              {!isModalMode && (
                <div className="auth-footer-toggle-text">
                  Already have an account? <Link to="/signin">Sign in</Link>
                </div>
              )}
            </form>
          ) : (
            /* OTP Verification Screen */
            <form onSubmit={handleVerifyOtp} className="auth-form-body">
              <div className="otp-sent-info-card">
                <CheckCircleOutlined style={{ fontSize: '2.2rem', color: '#10b981' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1.4rem' }}>
                    Verify Your {authMethod === 'phone' ? 'Mobile Number' : 'Email'}
                  </p>
                  <small style={{ color: '#64748b', fontSize: '1.2rem' }}>
                    Sent code to: <strong>{authMethod === 'phone' ? formData.phone : formData.email}</strong>
                  </small>
                </div>
              </div>

              <div className="form-field-item">
                <label className="field-label">ENTER 6-DIGIT OTP CODE</label>
                <div className="input-with-icon">
                  <span className="field-icon"><SafetyCertificateOutlined /></span>
                  <input
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-action-primary">
                {loading ? 'VERIFYING...' : 'VERIFY & CREATE ACCOUNT'}
              </button>

              <div className="otp-actions-flex">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => {
                    setOtpSent(false);
                    setEnteredOtp('');
                    setErrorMsg('');
                  }}
                >
                  <ArrowLeftOutlined /> Change Details
                </button>

                <button type="button" className={`btn-resend ${cooldown > 0 ? 'disabled' : ''}`} disabled={cooldown > 0 || loading} onClick={handleResend}>
                  {cooldown > 0 ? `Resend in 00:${cooldown < 10 ? `0${cooldown}` : cooldown}` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Google Account Selector Modal */}
      <Modal
        open={isGoogleModalOpen}
        onCancel={() => setIsGoogleModalOpen(false)}
        footer={null}
        centered
        width={420}
        destroyOnHidden
      >
        <div style={{ textAlign: 'center', padding: '12px 6px' }}>
          <svg viewBox="0 0 24 24" width="40" height="40" style={{ marginBottom: '12px' }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Choose a Google Account</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>to continue to {shopName}</p>

          <div 
            onClick={() => handleGoogleSignInSubmit('alex.pastry@gmail.com', 'Alex Morgan')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '10px',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
              A
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>Alex Morgan</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>alex.pastry@gmail.com</span>
            </div>
          </div>

          <div 
            onClick={() => handleGoogleSignInSubmit('sarah.bakes@gmail.com', 'Sarah Jenkins')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '18px',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#db2777', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
              S
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>Sarah Jenkins</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>sarah.bakes@gmail.com</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textAlign: 'left' }}>Or enter another Google Email:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                placeholder="your.email@gmail.com"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => handleGoogleSignInSubmit(googleEmailInput, googleNameInput)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#e02484',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
};

const AuthLayout = ({ children, isModalMode, currentView, bannerTitle, bannerSubtitle }) => {
  const { settings } = useSettings();
  const shopName = settings?.shopName || 'Mr. Pastry';
  const logoImg = settings?.logo ? `http://localhost:3000/images/${settings.logo}` : assets?.pastry || assets?.pastery_logo;
  const navigate = useNavigate();

  const bannerSlides = [
    {
      image: assets?.bakerySignupIllustration || assets?.bakeryHero,
      heading: bannerTitle || `Welcome to ${shopName}`,
      subtext: bannerSubtitle || 'Discover trending products, shop smarter, and enjoy a seamless online ordering experience.'
    },
    {
      image: assets?.bakerySlide2 || assets?.explodedCake,
      heading: "Artisanal Cake Selection",
      subtext: "Explore gourmet chocolate truffles, fresh fruit cakes, and bespoke celebration centercards."
    },
    {
      image: assets?.bakerySlide3 || assets?.explodedStrawberry,
      heading: "Fast Doorstep Delivery",
      subtext: "Order online and receive fresh, hand-crafted bakery treats delivered right to your door."
    }
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (isModalMode) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 5000); // 5 Seconds Auto Slide
    return () => clearInterval(timer);
  }, [isModalMode, bannerSlides.length]);

  const activeSlide = bannerSlides[currentSlideIndex];

  return (
    <main className={`auth-split-page ${isModalMode ? 'modal-mode' : ''}`}>
      <div className="auth-split-card-container">
        {/* Left Visual Pastel Banner with 5-Second 3-Slide Auto Carousel */}
        {!isModalMode && (
          <aside className="auth-left-banner-panel">
            <div className="banner-brand-badge">
              <div className="brand-icon-circle">
                {logoImg ? <img src={logoImg} alt={shopName} /> : <span>🧁</span>}
              </div>
              <span className="brand-title-text">{shopName}</span>
            </div>

            <div className="banner-illustration-box fade-in-slide" key={currentSlideIndex}>
              <img src={activeSlide.image} alt={activeSlide.heading} className="banner-illustration-img" />
            </div>

            <div className="banner-slide-content fade-in-slide" key={`text-${currentSlideIndex}`}>
              <h1 className="banner-main-heading">{activeSlide.heading}</h1>
              <p className="banner-main-subtext">{activeSlide.subtext}</p>
            </div>

            {/* Slider Dots Indicator */}
            <div className="banner-dots-row">
              {bannerSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`dot-pill ${currentSlideIndex === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlideIndex(idx)}
                />
              ))}
            </div>

            <div className="banner-toggle-pill-wrapper">
              {currentView === 'signup' ? (
                <button type="button" className="btn-banner-toggle-pill" onClick={() => navigate('/signin')}>
                  Sign in
                </button>
              ) : (
                <button type="button" className="btn-banner-toggle-pill" onClick={() => navigate('/signup')}>
                  Sign up
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Right Form Interactive Container */}
        <section className="auth-right-form-panel">
          {children}
        </section>
      </div>
    </main>
  );
};
