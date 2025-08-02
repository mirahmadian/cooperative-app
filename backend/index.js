const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// اتصال به Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// حافظه موقت برای نگهداری کدهای تایید
const codes = {};

// تابع ارسال پیام به بات بله
async function sendBaleMessage(user_id, code) {
  const token = '1004378078:xtkieq2LxVCvzbAwUHjElG7dHosvq8U2twSdS6OW';
  const url = `https://tapi.bale.ai/bot${token}/sendMessage`;
  const text = `*شرکت تعاونی مصرف کارکنان سازمان حج و زیارت*\nکد تایید شما جهت ورود به سامانه: <code>${code}</code>\nلطفاً به هیچوجه کد تایید را در اختیار دیگران نگذارید.\n*با احترام - هیئت مدیره تعاونی مصرف کارکنان سازمان حج و زیارت*`;
  try {
    await axios.post(url, {
      chat_id: user_id,
      text: text,
      parse_mode: "HTML"
    });
  } catch (err) {
    console.log('خطا در ارسال پیام به بله:', err.message);
  }
}

// تست اتصال به سرور و Supabase
app.get('/api/test', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
});

// ارسال کد تایید یا لینک بات بله
app.post('/api/auth/send-code', async (req, res) => {
  const { national_code } = req.body;
  if (!national_code) return res.status(400).json({ message: 'کدملی الزامی است' });

  // بررسی وجود کاربر
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('national_code', national_code)
    .single();

  if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

  // اگر شماره موبایل یا bale_user_id ثبت نشده بود
  if (!user.phone || !user.bale_user_id) {
    const botLink = 'https://ble.ir/TavoniBot';
    return res.json({
      need_phone: true,
      message: `برای دریافت کد تایید، لطفاً <a href="${botLink}" target="_blank">اینجا</a> کلیک کنید و شماره موبایل خود را با بات به اشتراک بگذارید.`
    });
  }

  // اگر شماره موبایل و bale_user_id وجود داشت، کد تایید را بفرست
  const code = Math.floor(10000 + Math.random() * 90000).toString(); // کد ۵ رقمی
  codes[national_code] = code;

  await sendBaleMessage(user.bale_user_id, code);

  res.json({ message: 'کد تایید ارسال شد' });
});

// تایید کد و ورود
app.post('/api/auth/verify-code', async (req, res) => {
  const { national_code, code } = req.body;
  if (!national_code || !code) return res.status(400).json({ message: 'کدملی و کد تایید الزامی است' });

  if (codes[national_code] !== code) return res.status(400).json({ message: 'کد تایید اشتباه است' });

  // دریافت اطلاعات کاربر
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('national_code', national_code)
    .single();

  if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

  // حذف کد تایید از حافظه
  delete codes[national_code];

  res.json({ user });
});

// صفحه اصلی
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});