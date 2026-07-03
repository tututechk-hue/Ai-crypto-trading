import nodemailer from 'nodemailer';
import axios from 'axios';

export async function sendEmail(to:string, subject:string, text:string){
  const host = process.env.SMTP_HOST;
  if(!host) throw new Error('SMTP not configured');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
}

export async function sendTelegram(text:string){
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if(!token || !chatId) throw new Error('telegram not configured');
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await axios.post(url, { chat_id: chatId, text });
}
