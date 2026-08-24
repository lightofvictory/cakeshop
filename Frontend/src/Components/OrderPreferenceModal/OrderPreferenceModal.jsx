import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { DatePicker, TimePicker } from 'antd';
import { TruckOutlined, CoffeeOutlined, ShopOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import './OrderPreferenceModal.scss';

dayjs.extend(utc);

const OrderPreferenceModal = () => {
  const { orderPreference, updateOrderPreference, isPreferenceModalOpen, closePreferenceModal } = useCart();

  const [mode, setMode] = useState(orderPreference?.mode || 'delivery');
  const [dateType, setDateType] = useState('Today'); // 'Today' | 'Tomorrow' | 'Custom'
  const [customDate, setCustomDate] = useState(() => dayjs());
  const [timeSlot, setTimeSlot] = useState(orderPreference?.timeSlot || '10:00 AM - 12:00 PM');

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
    
    // Parse time slot to calculate start/end hours
    let startHour = 10;
    if (timeSlot.includes('02:00 PM')) startHour = 14;
    if (timeSlot.includes('06:00 PM')) startHour = 18;
    if (timeSlot.includes('08:00 PM')) startHour = 20;

    // Create UTC ISO timestamp for backend payload
    const utcDateTime = targetDayjs.hour(startHour).minute(0).second(0).utc();
    const utcScheduledISO = utcDateTime.toISOString();

    const formattedDate = dateType === 'Today' ? 'Today' : dateType === 'Tomorrow' ? 'Tomorrow' : targetDayjs.format('ddd, DD MMM YYYY');
    const formattedTime = timeSlot;

    updateOrderPreference({
      mode,
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
    if (mode === 'dinein') return 'Bakery Dine In';
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
          <span className="pref-badge">Order Schedule</span>
          <h2>How would you like to receive your order?</h2>
          <p>Select your fulfillment method, date, and preferred time slot.</p>
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
              <h3>Delivery</h3>
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
              <h3>Dine In</h3>
              <p>Enjoy at our bakery cafe</p>
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
              <h3>Pick Up</h3>
              <p>Counter takeaway</p>
            </div>
            {mode === 'pickup' && <span className="check-badge"><CheckOutlined /></span>}
          </button>
        </div>

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
