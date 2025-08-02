const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const codes = {};
const codeExpire = {}; // زمان انقضا

// تابع ارسال پیام به بات بله
async function sendBaleMessage(user_id, code) {
  const token = '1004378078:xtkieq2LxVCvzbAwUHjElG7dHosvq8U2twSdS6OW';
  const url = `https://tapi.bale.ai/bot${token}/sendMessage`;
  const text = `*شرکت تعاونی مصرف کارکنان سازمان حج و زیارت*\nکد تایید شما جهت ورود به سامانه: ${code}\nلطفاً به هیچوجه کد تایید را در اختیار دیگران نگذارید.\n*با احترام - هیئت مدیره تعاونی مصرف کارکنان سازمان حج و زیارت*`;
  try {
    await axios.post(url, {
      chat_id: user_id,
      text: text,
      parse_mode: "Markdown"
    });
  } catch (err) {
    console.log('خطا در ارسال پیام به بله:', err.message);
  }
}

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

app.post('/api/auth/send-code', async (req, res) => {
  const { national_code } = req.body;
  if (!national_code) return res.status(400).json({ message: 'کدملی الزامی است' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('national_code', national_code)
    .single();

  if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

  if (!user.phone || !user.bale_user_id) {
    const botLink = 'https://ble.ir/TavoniBot';
    return res.json({
      need_phone: true,
      message: `برای دریافت کد تایید، لطفاً <a href="${botLink}" target="_blank">اینجا</a> کلیک کنید و شماره موبایل خود را با بات به اشتراک بگذارید.`
    });
  }

  const code = Math.floor(10000 + Math.random() * 90000).toString(); // کد ۵ رقمی
  codes[national_code] = code;
  codeExpire[national_code] = Date.now() + 3 * 60 * 1000; // 3 دقیقه

  await sendBaleMessage(user.bale_user_id, code);

  res.json({ message: 'کد تایید ارسال شد', expire: codeExpire[national_code] });
});

app.post('/api/auth/verify-code', async (req, res) => {
  const { national_code, code } = req.body;
  if (!national_code || !code) return res.status(400).json({ message: 'کدملی و کد تایید الزامی است' });

  if (!codes[national_code]) return res.status(400).json({ message: 'کد تایید منقضی شده است. دوباره درخواست دهید.' });

  if (Date.now() > codeExpire[national_code]) {
    delete codes[national_code];
    delete codeExpire[national_code];
    return res.status(400).json({ message: 'کد تایید منقضی شده است. دوباره درخواست دهید.' });
  }

  if (codes[national_code] !== code) return res.status(400).json({ message: 'کد تایید اشتباه است' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('national_code', national_code)
    .single();

  if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

  delete codes[national_code];
  delete codeExpire[national_code];

  res.json({ user });
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});