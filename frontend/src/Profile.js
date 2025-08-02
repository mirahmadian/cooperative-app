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
    setMessage('اطلاعات با موفقیت ذخیره شد!');
    if (onSave) onSave({ address, postal_code: postalCode });
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: '60px auto',
      padding: 32,
      borderRadius: 18,
      background: '#e8f5e9',
      boxShadow: '0 4px 24px #1b3c1a22',
      fontFamily: "'Vazir', Tahoma, Arial, sans-serif",
      direction: 'rtl',
      border: '2px solid #1b3c1a'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src="https://i.ibb.co/6b6n6n6/logo-tavoni.png" alt="لوگو" style={{ width: 64, marginBottom: 8 }} />
        <h2 style={{ color: '#1b3c1a', margin: 0, fontWeight: 'bold', fontSize: 26 }}>مشخصات کاربر</h2>
      </div>
      <div style={{ marginBottom: 14, color: '#1b3c1a', fontWeight: 'bold' }}>
        <span>نام:</span> <span style={{ fontWeight: 'normal' }}>{user.name}</span>
      </div>
      <div style={{ marginBottom: 14, color: '#1b3c1a', fontWeight: 'bold' }}>
        <span>نام خانوادگی:</span> <span style={{ fontWeight: 'normal' }}>{user.family}</span>
      </div>
      <div style={{ marginBottom: 14, color: '#1b3c1a', fontWeight: 'bold' }}>
        <span>کدملی:</span> <span style={{ fontWeight: 'normal' }}>{user.national_code}</span>
      </div>
      <div style={{ marginBottom: 14, color: '#1b3c1a', fontWeight: 'bold' }}>
        <span>شماره موبایل:</span> <span style={{ fontWeight: 'normal' }}>{user.phone}</span>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ color: '#1b3c1a', fontWeight: 'bold' }}>آدرس:</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            margin: '8px 0',
            borderRadius: 8,
            border: '1.5px solid #4caf50',
            background: '#fff',
            fontFamily: "'Vazir', Tahoma, Arial, sans-serif"
          }}
        />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ color: '#1b3c1a', fontWeight: 'bold' }}>کدپستی:</label>
        <input
          type="text"
          value={postalCode}
          onChange={e => setPostalCode(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            margin: '8px 0',
            borderRadius: 8,
            border: '1.5px solid #4caf50',
            background: '#fff',
            fontFamily: "'Vazir', Tahoma, Arial, sans-serif"
          }}
        />
      </div>
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: 12,
          background: '#ffd700',
          color: '#1b3c1a',
          border: 'none',
          borderRadius: 8,
          fontWeight: 'bold',
          fontSize: 18,
          boxShadow: '0 2px 8px #4caf5044',
          transition: 'background 0.2s'
        }}
      >
        ذخیره اطلاعات
      </button>
      {message && (
        <div style={{
          marginTop: 18,
          color: '#388e3c',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default Profile;