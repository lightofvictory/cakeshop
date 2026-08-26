import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { DatePicker } from 'antd';
import { TruckOutlined, CoffeeOutlined, ShopOutlined, CloseOutlined, CheckOutlined, QrcodeOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import './OrderPreferenceModal.scss';

dayjs.extend(utc);

const OrderPreferenceModal = () => {
  const { orderPreference, updateOrderPreference, isPreferenceModalOpen, closePreferenceModal } = useCart();

  const [mode, setMode] = useState(orderPreference?.mode || 'delivery');
  const [dateType, setDateType] = useState(orderPreference?.dateType || 'Today');
  const [customDate, setCustomDate] = useState(() => dayjs());
  const [timeSlot, setTimeSlot] = useState(orderPreference?.timeSlot || 'ASAP (25 MINS)');
  
  // Specific fulfillment options
  const [tableNumber, setTableNumber] = useState(orderPreference?.tableNumber || 'Table #1');
  const [guestCount, setGuestCount] = useState(orderPreference?.guestCount || 2);
  const [pickupBranch, setPickupBranch] = useState(orderPreference?.pickupBranch || 'Flagship Bakery - Downtown');

  useEffect(() => {
    if (isPreferenceModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isPreferenceModalOpen]);

  if (!isPreferenceModalOpen) return null;

  const getTargetDayjsDate = () => {
    if (dateType === 'Today') return dayjs();
    if (dateType === 'Tomorrow') return dayjs().add(1, 'day');
    return customDate || dayjs();
  };

  const handleConfirm = () => {
    const targetDayjs = getTargetDayjsDate();
    
    let startHour = 10;
    if (timeSlot.includes('02:00 PM')) startHour = 14;
    if (timeSlot.includes('06:00 PM')) startHour = 18;
    if (timeSlot.includes('08:00 PM')) startHour = 20;

    const utcDateTime = targetDayjs.hour(startHour).minute(0).second(0).utc();
    const utcScheduledISO = utcDateTime.toISOString();

    const formattedDate = dateType === 'Today' ? 'Today' : dateType === 'Tomorrow' ? 'Tomorrow' : targetDayjs.format('ddd, DD MMM YYYY');
    const formattedTime = timeSlot;

    updateOrderPreference({
      mode,
      tableNumber,
      guestCount,
      pickupBranch,
      utcScheduledISO,
      formattedDate,
      formattedTime,
      dateType,
      timeSlot
    });
    closePreferenceModal();
  };

  const getModeTitle = () => {
    if (mode === 'delivery') return 'Delivery';
    if (mode === 'dinein') return 'Dine In';
    return 'Store Pick Up';
  };

  const displayDateText = dateType === 'Today' ? 'Today' : dateType === 'Tomorrow' ? 'Tomorrow' : customDate?.format('ddd, DD MMM YYYY');

  return (
    <div className="order-pref-backdrop" onClick={closePreferenceModal}>
      <div className="order-pref-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="close-pref-btn" onClick={closePreferenceModal} aria-label="Close modal">
          <CloseOutlined />
        </button>

        <div className="modal-header">
          <span className="pref-badge">Order Fulfillment</span>
          <h2>How would you like to receive your order?</h2>
          <p>Select your preferred order type, table / branch, and time schedule.</p>
        </div>

        {/* 1. Fulfillment Mode Selection */}
        <div className="fulfillment-grid">
          <button 
            type="button" 
            className={`fulfillment-card ${mode === 'delivery' ? 'active' : ''}`}
            onClick={() => setMode('delivery')}
          >
            <div className="icon">
              <TruckOutlined style={{ fontSize: '2.8rem' }} />
            </div>
            <div className="card-info">
              <h3>🚚 Delivery</h3>
              <p>Fresh doorstep delivery</p>
            </div>
            {mode === 'delivery' && <span className="check-badge"><CheckOutlined /></span>}
          </button>

          <button 
            type="button" 
            className={`fulfillment-card ${mode === 'dinein' ? 'active' : ''}`}
            onClick={() => setMode('dinein')}
          >
            <div className="icon">
              <CoffeeOutlined style={{ fontSize: '2.8rem' }} />
            </div>
            <div className="card-info">
              <h3>🍽️ Dine In</h3>
              <p>Enjoy at our bakery café</p>
            </div>
            {mode === 'dinein' && <span className="check-badge"><CheckOutlined /></span>}
          </button>

          <button 
            type="button" 
            className={`fulfillment-card ${mode === 'pickup' ? 'active' : ''}`}
            onClick={() => setMode('pickup')}
          >
            <div className="icon">
              <ShopOutlined style={{ fontSize: '2.8rem' }} />
            </div>
            <div className="card-info">
              <h3>🛍️ Pick Up</h3>
              <p>Counter takeaway</p>
            </div>
            {mode === 'pickup' && <span className="check-badge"><CheckOutlined /></span>}
          </button>
        </div>

        {/* Dynamic Mode-Specific Controls */}
        {mode === 'dinein' && (
          <div className="mode-specific-box">
            <div className="control-row">
              <div className="control-item">
                <label><QrcodeOutlined /> Select Table Number:</label>
                <select value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}>
                  {Array.from({ length: 15 }, (_, i) => `Table #${i + 1}`).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="Scan QR Code">Scan QR Code on Table 📱</option>
                </select>
              </div>
              <div className="control-item">
                <label><UserOutlined /> Guests Count:</label>
                <select value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 8, 10].map(g => (
                    <option key={g} value={g}>{g} {g === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {mode === 'pickup' && (
          <div className="mode-specific-box">
            <div className="control-item full-width">
              <label><EnvironmentOutlined /> Select Pickup Branch:</label>
              <select value={pickupBranch} onChange={(e) => setPickupBranch(e.target.value)}>
                <option value="Flagship Bakery - Downtown">Flagship Bakery - 100 Cake Avenue, Downtown</option>
                <option value="Westside Mall Branch">Westside Mall - Food Court, Level 2</option>
                <option value="Eastside Café & Bakehouse">Eastside Bakehouse - 45 Sweet Street</option>
              </select>
            </div>
          </div>
        )}

        {/* 2. Date Selection (Today, Tomorrow, Calendar DatePicker) */}
        <div className="section-group">
          <label className="section-title">Select Date:</label>
          <div className="date-pill-group">
            <button 
              type="button" 
              className={`date-pill ${dateType === 'Today' ? 'active' : ''}`}
              onClick={() => setDateType('Today')}
            >
              Today
            </button>
            <button 
              type="button" 
              className={`date-pill ${dateType === 'Tomorrow' ? 'active' : ''}`}
              onClick={() => setDateType('Tomorrow')}
            >
              Tomorrow
            </button>
            <button 
              type="button" 
              className={`date-pill ${dateType === 'Custom' ? 'active' : ''}`}
              onClick={() => setDateType('Custom')}
            >
              Pick Date 📅
            </button>
          </div>

          {dateType === 'Custom' && (
            <div className="antd-picker-wrapper" style={{ marginTop: '1rem' }}>
              <DatePicker 
                className="antd-custom-datepicker"
                value={customDate}
                onChange={(val) => val && setCustomDate(val)}
                disabledDate={(current) => current && current.endOf('day').isBefore(dayjs().startOf('day'))}
                format="ddd, DD MMM YYYY"
                size="large"
              />
            </div>
          )}
        </div>

        {/* 3. Time Slot Selection */}
        <div className="section-group">
          <label className="section-title">Select Time Slot:</label>
          <div className="time-slot-grid">
            {[
              'ASAP (25 MINS)',
              '10:00 AM - 12:00 PM',
              '02:00 PM - 04:00 PM',
              '06:00 PM - 08:00 PM',
              '08:00 PM - 10:00 PM'
            ].map((slot) => (
              <button 
                key={slot}
                type="button"
                className={`time-slot-btn ${timeSlot === slot ? 'active' : ''}`}
                onClick={() => setTimeSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <button type="button" className="confirm-pref-btn" onClick={handleConfirm}>
          Confirm {getModeTitle()} • {displayDateText} ({timeSlot})
        </button>
      </div>
    </div>
  );
};

export default OrderPreferenceModal;
