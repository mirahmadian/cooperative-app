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
global.codes = global.codes || {};

// ارسال پیام به بات بله
async function sendBaleMessage(user_id, text) {
  // توکن بات بله را دقیقاً همینجا قرار بده (بدون فاصله اضافی)
  const token = '1004378078:xtkieq2LxVCvzbAwUHjElG7dHosvq8U2twSdS6OW';
  const url = `https://tapi.bale.ai/bot${token}/sendMessage`;
  await axios.post(url, {
    chat_id: user_id,
    text: text
  });
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
    const botLink = `https://ble.ir/TavoniBot?start=${national_code}`;
    return res.json({
      need_phone: true,
      message: `برای دریافت کد تایید، لطفاً <a href="${botLink}" target="_blank">اینجا</a> کلیک کنید و شماره موبایل خود را با بات به اشتراک بگذارید.`
    });
  }

  // اگر شماره موبایل و bale_user_id وجود داشت، کد تایید را بفرست
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  global.codes[national_code] = code;

  // ارسال کد تایید به بله
  try {
    await sendBaleMessage(user.bale_user_id, `کد تایید شما: ${code}`);
  } catch (err) {
    console.log('خطا در ارسال پیام به بله:', err.message, err.response?.data);
    return res.status(500).json({ message: 'خطا در ارسال پیام به بله' });
  }

  res.json({ message: 'کد تایید ارسال شد' });
});

// تایید کد و ورود
app.post('/api/auth/verify-code', async (req, res) => {
  const { national_code, code } = req.body;
  if (!national_code || !code) return res.status(400).json({ message: 'کدملی و کد تایید الزامی است' });

  if (global.codes[national_code] !== code) return res.status(400).json({ message: 'کد تایید اشتباه است' });

  // دریافت اطلاعات کاربر
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('national_code', national_code)
    .single();

  if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

  // حذف کد تایید از حافظه
  delete global.codes[national_code];

  res.json({ user });
});

// آپدیت پروفایل کاربر
app.post('/api/user/update-profile', async (req, res) => {
  const { national_code, address, postal_code } = req.body;
  if (!national_code || !address || !postal_code)
    return res.status(400).json({ message: 'همه فیلدها الزامی است' });

  const { data, error } = await supabase
    .from('users')
    .update({ address, postal_code })
    .eq('national_code', national_code)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json({ user: data });
});

// صفحه اصلی
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});