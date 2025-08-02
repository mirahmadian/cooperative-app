import React, { useState } from 'react';

function Profile({ user, onSave }) {
  const [address, setAddress] = useState(user.address || '');
  const [postalCode, setPostalCode] = useState(user.postal_code || '');
  const [message, setMessage] = useState('');

  const handleSave = () => {
    if (!address || !postalCode) {
      setMessage('لطفاً همه فیلدها را پر کنید.');
      return;
    }
    // اینجا می‌توانی اطلاعات را به سرور ارسال کنی (در مراحل بعدی)
    setMessage('اطلاعات با موفقیت ذخیره شد!');
    if (onSave) onSave({ address, postal_code: postalCode });
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '80px auto',
      padding: 24,
      border: '1px solid #eee',
      borderRadius: 12,
      boxShadow: '0 2px 8px #eee',
      background: '#fff',
      fontFamily: "'Vazir', Tahoma, Arial, sans-serif",
      direction: 'rtl'
    }}>
      <h2 style={{ textAlign: 'center' }}>پروفایل کاربر</h2>
      <div style={{ marginBottom: 12 }}>
        <b>نام:</b> {user.name}
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>نام خانوادگی:</b> {user.family}
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>کدملی:</b> {user.national_code}
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>شماره موبایل:</b> {user.phone}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>آدرس:</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{
            width: '100%',
            padding: 8,
            margin: '8px 0',
            borderRadius: 6,
            border: '1px solid #ccc'
          }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>کدپستی:</label>
        <input
          type="text"
          value={postalCode}
          onChange={e => setPostalCode(e.target.value)}
          style={{
            width: '100%',
            padding: 8,
            margin: '8px 0',
            borderRadius: 6,
            border: '1px solid #ccc'
          }}
        />
      </div>
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: 10,
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 'bold'
        }}
      >
        ذخیره اطلاعات
      </button>
      {message && (
        <div style={{
          marginTop: 16,
          color: '#388e3c',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default Profile;