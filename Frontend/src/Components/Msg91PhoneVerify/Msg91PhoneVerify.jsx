import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Input, Button, notification } from 'antd';
import {
  PhoneOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ReloadOutlined,
  LockOutlined,
} from '@ant-design/icons';
import './Msg91PhoneVerify.scss';

const Msg91PhoneVerify = ({ open, onClose, currentPhone, onSuccess }) => {
  // Step state: 'INPUT_PHONE' | 'VERIFY_OTP' | 'SUCCESS'
  const [step, setStep] = useState('INPUT_PHONE');

  // Phone input states (defaults to Indian +91 format)
  const [phoneDigits, setPhoneDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Verification states
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(30);

  // Prefill phone digits if provided
  useEffect(() => {
    if (currentPhone) {
      const cleanDigits = currentPhone.replace(/[^0-9]/g, '').slice(-10);
      setPhoneDigits(cleanDigits);
    }
  }, [currentPhone]);

  // Cooldown timer for Resend OTP (30s)
  useEffect(() => {
    let timer;
    if (step === 'VERIFY_OTP' && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Helper to format clean 10-digit Indian mobile
  const getCleanMobile = () => phoneDigits.replace(/[^0-9]/g, '').slice(-10);

  // Helper to mask phone number for UI display
  const getMaskedPhone = () => {
    const clean = getCleanMobile();
    if (clean.length < 10) return `+91 ${clean}`;
    return `+91 ******${clean.slice(-4)}`;
  };

  // Step 1: Send OTP via Backend MSG91 Endpoint
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanMobile = getCleanMobile();
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3000/api/users/send-otp', {
        mobile: cleanMobile,
      });

      if (res.data && res.data.success) {
        setStep('VERIFY_OTP');
        setCooldown(30);
        setOtpCode('');

        notification.success({
          message: 'OTP Sent Successfully! 📲',
          description: res.data.message || `Verification code sent to ${getMaskedPhone()}`,
          placement: 'topRight',
        });
      } else {
        setErrorMsg(res.data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('MSG91 Send OTP Error:', error);
      setErrorMsg(error?.response?.data?.message || 'Server error sending SMS OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP via Backend MSG91 Endpoint
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('mr-pastry-access-token');
      const savedUser = JSON.parse(localStorage.getItem('mr-pastry-user') || '{}');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        'http://localhost:3000/api/users/verify-otp',
        {
          mobile: getCleanMobile(),
          otp: cleanOtp,
          email: savedUser.email || undefined,
        },
        { headers }
      );

      if (res.data && res.data.success && res.data.verified) {
        setStep('SUCCESS');
        notification.success({
          message: 'Mobile Verified! ✅',
          description: 'Your customer profile has been securely marked as verified.',
          placement: 'topRight',
        });

        if (onSuccess) {
          onSuccess(res.data.user);
        }

        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setErrorMsg(res.data.message || 'Invalid or expired OTP code');
      }
    } catch (error) {
      console.error('MSG91 Verify OTP Error:', error);
      setErrorMsg(error?.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Resend OTP via Backend Endpoint
  const handleResendOtp = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3000/api/users/resend-otp', {
        mobile: getCleanMobile(),
      });

      if (res.data && res.data.success) {
        setCooldown(30);
        notification.info({
          message: 'OTP Resent 🔄',
          description: 'A new 6-digit verification code has been dispatched to your mobile.',
          placement: 'topRight',
        });
      } else {
        setErrorMsg(res.data.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || 'Error resending OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Reset state on Modal close
  const handleClose = () => {
    setStep('INPUT_PHONE');
    setErrorMsg('');
    setOtpCode('');
    if (onClose) onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={440}
      destroyOnClose
      className="msg91-phone-modal"
    >
      <div className="phone-verify-inner">
        {step === 'INPUT_PHONE' && (
          <div className="verify-step-box">
            <div className="verify-badge">
              <PhoneOutlined style={{ fontSize: '24px', color: '#f43f5e' }} />
            </div>
            <h2>Verify Mobile Number</h2>
            <p className="subtitle">
              Enter your Indian mobile number to receive a 6-digit security OTP via MSG91.
            </p>

            <form onSubmit={handleSendOtp} className="phone-form">
              <div className="form-group">
                <label>Mobile Number (India +91) *</label>
                <div className="e164-input-wrapper">
                  <span className="country-code">+91</span>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value.replace(/[^0-9]/g, ''))}
                    prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
                    size="large"
                    autoFocus
                  />
                </div>
              </div>

              {errorMsg && <div className="error-alert-banner">{errorMsg}</div>}

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="action-submit-btn"
              >
                Send Verification OTP
              </Button>
            </form>
          </div>
        )}

        {step === 'VERIFY_OTP' && (
          <div className="verify-step-box">
            <div className="verify-badge">
              <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#f43f5e' }} />
            </div>
            <h2>Verify Your Mobile Number</h2>
            <p className="subtitle">
              We sent a verification code to <strong>{getMaskedPhone()}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} className="phone-form">
              <div className="form-group">
                <label>6-Digit OTP Code *</label>
                <Input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  size="large"
                  style={{ letterSpacing: '0.4em', textAlign: 'center', fontWeight: '800', fontSize: '18px' }}
                  autoFocus
                />
              </div>

              {errorMsg && <div className="error-alert-banner">{errorMsg}</div>}

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="action-submit-btn"
              >
                Verify OTP
              </Button>

              <div className="otp-actions-bar">
                <button
                  type="button"
                  className="link-btn"
                  disabled={cooldown > 0 || loading}
                  onClick={handleResendOtp}
                >
                  <ReloadOutlined /> {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </button>

                <button
                  type="button"
                  className="link-btn secondary"
                  onClick={() => {
                    setStep('INPUT_PHONE');
                    setErrorMsg('');
                  }}
                >
                  <EditOutlined /> Change Number
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="verify-step-box success-state">
            <div className="verify-badge success">
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#10b981' }} />
            </div>
            <h2>Mobile Verified! ✅</h2>
            <p className="subtitle">Your customer account has been securely marked as verified.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Msg91PhoneVerify;
