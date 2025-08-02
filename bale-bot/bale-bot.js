const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// اطلاعات اتصال به Supabase
const SUPABASE_URL = 'https://zsrbjuflkouvdobvgkjr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcmJqdWZsa291dmRvYnZna2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NzEzMTgsImV4cCI6MjA2OTM0NzMxOH0.eWLhwJu5a5AUf8wBK2pkRCWhurROetR8ay3Yq_34l04';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// توکن بات بله
const BALE_TOKEN = '1004378078:xtkieq2LxVCvzbAwUHjElG7dHosvq8U2twSdS6OW';
const BALE_API = `https://tapi.bale.ai/bot${BALE_TOKEN}`;

const app = express();
app.use(bodyParser.json());

app.post(`/webhook/${BALE_TOKEN}`, async (req, res) => {
  const update = req.body;

  // اگر پیام متنی بود
  if (update.message && update.message.text) {
    const chat_id = update.message.chat.id;
    const text = update.message.text.trim();

    // اگر پیام /start بود
    if (text.startsWith('/start')) {
      // استخراج کدملی از پیام
      const parts = text.split(' ');
      let national_code = '';
      if (parts.length > 1) national_code = parts[1];

      // چک کن که شماره موبایل قبلاً ثبت شده یا نه
      let user = null;
      if (national_code) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('national_code', national_code)
          .single();
        user = data;
      }

      if (user && user.phone) {
        // اگر شماره موبایل قبلاً ثبت شده بود
        await axios.post(`${BALE_API}/sendMessage`, {
          chat_id,
          text: 'شماره موبایل شما قبلاً ثبت شده است. برای دریافت کد تایید به سایت مراجعه کنید.',
          reply_markup: { remove_keyboard: true }
        });
      } else if (user) {
        // اگر شماره موبایل ثبت نشده بود
        await axios.post(`${BALE_API}/sendMessage`, {
          chat_id,
          text: 'لطفاً شماره موبایل خود را با دکمه زیر ارسال کنید.',
          reply_markup: {
            keyboard: [
              [
                {
                  text: 'ارسال شماره موبایل',
                  request_contact: true
                }
              ]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        });
        // کدملی را در حافظه نگه دار
        global.nationalCodes = global.nationalCodes || {};
        global.nationalCodes[chat_id] = national_code;
      } else {
        await axios.post(`${BALE_API}/sendMessage`, {
          chat_id,
          text: 'کدملی شما شناسایی نشد. لطفاً دوباره از سایت اقدام کنید.',
          reply_markup: { remove_keyboard: true }
        });
      }
    }
  }

  // اگر پیام حاوی شماره موبایل بود
  if (update.message && update.message.contact) {
    const chat_id = update.message.chat.id;
    const phone = update.message.contact.phone_number;
    const national_code = global.nationalCodes ? global.nationalCodes[chat_id] : '';

    if (national_code) {
      const { data, error } = await supabase
        .from('users')
        .update({ phone, bale_user_id: chat_id })
        .eq('national_code', national_code)
        .select();

      if (error) {
        await axios.post(`${BALE_API}/sendMessage`, {
          chat_id,
          text: 'خطا در ذخیره شماره موبایل. لطفاً دوباره تلاش کنید.',
          reply_markup: { remove_keyboard: true }
        });
      } else {
        await axios.post(`${BALE_API}/sendMessage`, {
          chat_id,
          text: 'شماره موبایل شما با موفقیت ثبت شد! حالا می‌توانید به سایت مراجعه و کد تایید را دریافت کنید.',
          reply_markup: { remove_keyboard: true }
        });
      }
    } else {
      await axios.post(`${BALE_API}/sendMessage`, {
        chat_id,
        text: 'کدملی شما شناسایی نشد. لطفاً دوباره از سایت اقدام کنید.',
        reply_markup: { remove_keyboard: true }
      });
    }
  }

  res.sendStatus(200);
});

// راه‌اندازی سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bale bot server running on port ${PORT}`);
});