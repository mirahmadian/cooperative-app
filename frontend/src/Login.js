import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [nationalCode, setNationalCode] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [needPhone, setNeedPhone] = useState(false);

  // آدرس بک‌اند روی Render
  const backendUrl = 'https://cooperative-app.onrender.com';

  const sendCode = async () => {
    setMessage('');
    setNeedPhone(false);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/send-code`, { national_code: nationalCode });
      if (res.data.need_phone) {
        setNeedPhone(true);
        setMessage(res.data.message);
      } else {
        setStep(2);
        setMessage('کد تایید به بات بله شما ارسال شد.');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'خطا در ارسال کد تایید');
    }
  };

  const verifyCode = async () => {
    setMessage('');
    try {
      const res = await axios.post(`${backendUrl}/api/auth/verify-code`, { national_code: nationalCode, code });
      setMessage('ورود موفقیت‌آمیز بود!');
      // اینجا می‌توانی کاربر را به صفحه بعدی هدایت کنی یا اطلاعاتش را ذخیره کنی
    } catch (err) {
      setMessage(err.response?.data?.message || 'خطا در ورود');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 12, boxShadow: '0 2px 8px #eee', background: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>ورود به سامانه تعاونی</h2>
      {step === 1 && (
        <>
          <label>کدملی:</label>
          <input
            type="text"
            value={nationalCode}
            onChange={e => setNationalCode(e.target.value)}
            style={{ width: '100%', padding: 8, margin: '8px 0', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button onClick={sendCode} style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>
            دریافت کد تایید
          </button>
        </>
      )}
      {needPhone && (
        <div style={{ marginTop: 16, color: '#d32f2f', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: message }} />
      )}
      {step === 2 && (
        <>
          <label>کد تایید:</label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ width: '100%', padding: 8, margin: '8px 0', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button onClick={verifyCode} style={{ width: '100%', padding: 10, background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>
            ورود
          </button>
        </>
      )}
      {message && <div style={{ marginTop: 16, color: step === 2 ? '#388e3c' : '#d32f2f', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: message }} />}
    </div>
  );
}

export default Login;