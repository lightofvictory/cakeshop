import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { DatePicker, Select } from 'antd';
import {
  TruckOutlined,
  CoffeeOutlined,
  ShopOutlined,
  CloseOutlined,
  CheckOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import './OrderPreferenceModal.scss';

dayjs.extend(utc);

const OrderPreferenceModal = () => {
  const { orderPreference, updateOrderPreference, isPreferenceModalOpen, closePreferenceModal, outlets } = useCart();
  const { user, updateOrderPreferences } = useAuth();

  // 1. Primary Decision: Fulfillment Mode
  const [mode, setMode] = useState(user?.preferredFulfillment || orderPreference?.mode || 'delivery');
  const [scheduledDateTime, setScheduledDateTime] = useState(() => {
    if (orderPreference?.utcScheduledISO) return dayjs(orderPreference.utcScheduledISO);
    return dayjs();
  });

  // Fulfillment specific fields
  const [tableNumber, setTableNumber] = useState(orderPreference?.tableNumber || '');
  const [guestCount, setGuestCount] = useState(orderPreference?.guestCount || '');
  const [pickupBranch, setPickupBranch] = useState(orderPreference?.pickupBranch || 'Downtown Bakery Outlet');

  useEffect(() => {
    if (orderPreference) {
      setMode(user?.preferredFulfillment || orderPreference.mode || 'delivery');
      if (orderPreference.utcScheduledISO) {
        setScheduledDateTime(dayjs(orderPreference.utcScheduledISO));
      }
      setTableNumber(orderPreference.tableNumber || '');
      setGuestCount(orderPreference.guestCount || '');
      setPickupBranch(orderPreference.pickupBranch || 'Downtown Bakery Outlet');
    }
  }, [orderPreference, user]);

  if (!isPreferenceModalOpen) return null;

  const handleConfirm = async () => {
    const targetDayjs = scheduledDateTime || dayjs();
    const utcDateTime = targetDayjs.utc();
    const utcDateStr = utcDateTime.format('YYYY-MM-DD');
    const utcScheduledISO = utcDateTime.toISOString();

    const formattedDate = targetDayjs.format('ddd, DD MMM YYYY');
    const formattedTime = targetDayjs.format('hh:mm A');

    // Clean up table number formatting to prevent duplicate "Table" words
    let cleanTable = tableNumber ? tableNumber.trim() : '';

    const updatedPref = {
      mode,
      tableNumber: cleanTable || '#1',
      guestCount: guestCount || '2',
      pickupBranch: pickupBranch || 'Downtown Bakery Outlet',
      utcDateStr,
      utcScheduledISO,
      formattedDate,
      formattedTime,
      dateType: 'Custom',
      timeSlot: formattedTime,
      isConfigured: true,
    };

    updateOrderPreference(updatedPref);

    if (user) {
      await updateOrderPreferences({
        preferredFulfillment: mode,
        isPreferenceConfigured: true,
      });
    }

    closePreferenceModal();
  };

  const getConfirmButtonText = () => {
    if (mode === 'dinein') {
      const tNo = tableNumber ? (tableNumber.toLowerCase().includes('table') ? tableNumber : `Table #${tableNumber}`) : 'Table #1';
      const gCnt = guestCount ? `${guestCount} Guests` : '2 Guests';
      return `Confirm 🍽️ Dine In • ${tNo} (${gCnt})`;
    }
    if (mode === 'pickup') {
      return `Confirm 🛍️ Store Pickup • ${pickupBranch}`;
    }
    const timeStr = scheduledDateTime ? scheduledDateTime.format('ddd, DD MMM, hh:mm A') : 'ASAP';
    return `Confirm 🚚 Delivery • ${timeStr}`;
  };

  return (
    <div className="order-pref-backdrop" onClick={closePreferenceModal}>
      <div className="order-pref-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className="close-pref-btn" onClick={closePreferenceModal} aria-label="Close modal">
          <CloseOutlined />
        </button>

        {/* Modal Header */}
        <header className="modal-header">
          <span className="pref-badge">ORDER PREFERENCE</span>
          <h2>Select Order Type</h2>
          <p>Choose how you would like to receive your bakes</p>
        </header>

        {/* 1. Fulfillment Mode Selection Grid */}
        <div className="section-group">
          <div className="fulfillment-grid">
            <button
              type="button"
              className={`fulfillment-card ${mode === 'delivery' ? 'active' : ''}`}
              onClick={() => setMode('delivery')}
            >
              <div className="icon">
                <TruckOutlined style={{ fontSize: '20px' }} />
              </div>
              <div className="card-info">
                <h3>Delivery</h3>
                <p>Doorstep</p>
              </div>
              {mode === 'delivery' && (
                <span className="check-badge">
                  <CheckOutlined />
                </span>
              )}
            </button>

            <button
              type="button"
              className={`fulfillment-card ${mode === 'dinein' ? 'active' : ''}`}
              onClick={() => setMode('dinein')}
            >
              <div className="icon">
                <CoffeeOutlined style={{ fontSize: '20px' }} />
              </div>
              <div className="card-info">
                <h3>Dine In</h3>
                <p>At Table</p>
              </div>
              {mode === 'dinein' && (
                <span className="check-badge">
                  <CheckOutlined />
                </span>
              )}
            </button>

            <button
              type="button"
              className={`fulfillment-card ${mode === 'pickup' ? 'active' : ''}`}
              onClick={() => setMode('pickup')}
            >
              <div className="icon">
                <ShopOutlined style={{ fontSize: '20px' }} />
              </div>
              <div className="card-info">
                <h3>Pick Up</h3>
                <p>Takeaway</p>
              </div>
              {mode === 'pickup' && (
                <span className="check-badge">
                  <CheckOutlined />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. Dynamic Mode-Specific Fields */}
        {mode === 'dinein' && (
          <div className="mode-specific-box">
            <div className="control-row">
              <div className="control-item">
                <label>Table Number / Code</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. 4"
                />
              </div>
              <div className="control-item">
                <label>Number of Guests</label>
                <input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="e.g. 2"
                />
              </div>
            </div>
          </div>
        )}

        {mode === 'pickup' && (
          <div className="mode-specific-box">
            <div className="control-item full-width">
              <label>
                <EnvironmentOutlined style={{ color: 'var(--primary)' }} /> Select Pickup Branch
              </label>
              <Select
                value={pickupBranch || undefined}
                placeholder="Select Pickup Branch"
                onChange={(val) => setPickupBranch(val)}
                className="antd-branch-select"
                popupClassName="custom-antd-branch-popup"
                getPopupContainer={() => document.body}
                size="large"
                style={{ width: '100%' }}
                options={
                  outlets && outlets.length > 0
                    ? outlets.map((o) => {
                        const name = typeof o === 'string' ? o : (o.name || o.outletName || String(o));
                        return { value: name, label: name };
                      })
                    : [
                        { value: 'Downtown Bakery Outlet', label: 'Downtown Bakery Outlet' },
                        { value: 'Indiranagar Flagship Bakery', label: 'Indiranagar Flagship Bakery' },
                        { value: 'Koramangala Bakes Outlet', label: 'Koramangala Bakes Outlet' },
                      ]
                }
              />
            </div>
          </div>
        )}

        {/* 3. Schedule Date & Time Selection (For All Order Types) */}
        <div className="section-group">
          <label className="section-title">Schedule Date & Time</label>
          <div className="antd-picker-wrapper">
            <DatePicker
              showTime={{ format: 'hh:mm A', use12Hours: true }}
              className="antd-custom-datepicker"
              value={scheduledDateTime}
              onChange={(val) => val && setScheduledDateTime(val)}
              disabledDate={(current) => current && current.endOf('day').isBefore(dayjs().startOf('day'))}
              format="ddd, DD MMM YYYY, hh:mm A"
              size="large"
              getPopupContainer={() => document.body}
              popupClassName="custom-antd-date-popup"
              placement="bottomLeft"
              style={{ width: '100%', borderRadius: '12px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* 4. Action Confirm Button */}
        <button type="button" className="confirm-pref-btn" onClick={handleConfirm}>
          {getConfirmButtonText()}
        </button>
      </div>
    </div>
  );
};

export default OrderPreferenceModal;
