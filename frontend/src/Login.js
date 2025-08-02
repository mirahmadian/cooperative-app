import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [nationalCode, setNationalCode] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [needPhone, setNeedPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expire, setExpire] = useState(null);
  const [timer, setTimer] = useState(180);

  const backendUrl = 'https://cooperative-app.onrender.com';
  const codeInputRef = useRef();

  // ثانیه‌شمار
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    if (timer === 0) {
      setMessage('کد تایید منقضی شد. دوباره درخواست دهید.');
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const sendCode = async () => {
    setMessage('');
    setNeedPhone(false);
    setLoading(true);
    setCode('');
    setTimer(180);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/send-code`, { national_code: nationalCode });
      if (res.data.need_phone) {
        setNeedPhone(true);
        setMessage(res.data.message);
      } else {
        setStep(2);
        setMessage('کد تایید به بات بله شما ارسال شد.');
        setExpire(res.data.expire);
        setTimeout(() => {
          setTimer(0);
        }, 180 * 1000);
        setTimeout(() => {
          codeInputRef.current && codeInputRef.current.focus();
        }, 300);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'خطا در ارسال کد تایید');
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/verify-code`, { national_code: nationalCode, code });
      setMessage('ورود موفقیت‌آمیز بود!');
      if (onLogin) onLogin(res.data.user);
    } catch (err) {
      setMessage(err.response?.data?.message || 'خطا در ورود');
    }
    setLoading(false);
  };

  // نمایش ثانیه‌شمار به صورت دقیقه:ثانیه
  const formatTimer = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
      <h2 style={{ textAlign: 'center' }}>ورود به سامانه تعاونی</h2>
      {step === 1 && (
        <>
          <label style={{ display: 'block', marginBottom: 8 }}>کدملی خود را وارد نمایید:</label>
          <input
            type="text"
            value={nationalCode}
            onChange={e => setNationalCode(e.target.value.replace(/[^0-9]/g, ''))}
            style={{
              width: '100%',
              padding: 8,
              margin: '8px 0',
              borderRadius: 6,
              border: '1px solid #ccc',
              textAlign: 'center',
              fontFamily: "'Vazir', Tahoma, Arial, sans-serif",
              fontSize: 18
            }}
            disabled={loading}
            maxLength={10}
            placeholder="کدملی"
          />
          <button
            onClick={sendCode}
            style={{
              width: '100%',
              padding: 10,
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold'
            }}
            disabled={loading || nationalCode.length !== 10}
          >
            {loading ? (
              <span>
                <span role="img" aria-label="loading">⏳</span> لطفاً صبر کنید...
              </span>
            ) : (
              'دریافت کد تایید'
            )}
          </button>
          {needPhone && message && (
            <div
              style={{
                marginTop: 16,
                color: '#d32f2f',
                textAlign: 'center'
              }}
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
          {!needPhone && message && (
            <div
              style={{
                marginTop: 16,
                color: '#d32f2f',
                textAlign: 'center'
              }}
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
        </>
      )}
      {step === 2 && (
        <>
          <label style={{ display: 'block', marginBottom: 8 }}>کد تایید را وارد نمایید:</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              ref={codeInputRef}
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 6,
                border: '1px solid #ccc',
                textAlign: 'center',
                fontSize: 24,
                letterSpacing: '12px',
                fontFamily: "'Vazir', Tahoma, Arial, sans-serif",
                background: 'transparent',
                position: 'relative',
                zIndex: 2
              }}
              disabled={loading || timer === 0}
              maxLength={5}
              placeholder=""
            />
            {/* خطوط راهنما */}
            {code.length === 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 1,
                color: '#bbb',
                fontSize: 24,
                letterSpacing: '12px',
                fontFamily: "'Vazir', Tahoma, Arial, sans-serif"
              }}>
                - - - - -
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', marginBottom: 8, color: timer > 0 ? '#1976d2' : '#d32f2f', fontWeight: 'bold' }}>
            {timer > 0 ? `زمان باقی‌مانده: ${formatTimer()}` : 'کد تایید منقضی شد'}
          </div>
          <button
            onClick={verifyCode}
            style={{
              width: '100%',
              padding: 10,
              background: '#388e3c',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold'
            }}
            disabled={loading || code.length !== 5 || timer === 0}
          >
            {loading ? (
              <span>
                <span role="img" aria-label="loading">⏳</span> لطفاً صبر کنید...
              </span>
            ) : (
              'ورود'
            )}
          </button>
          {message && (
            <div
              style={{
                marginTop: 16,
                color: '#388e3c',
                textAlign: 'center'
              }}
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Login;