// testMail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function sendTestMail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Bahath Jobz" <${process.env.EMAIL_USER}>`,
    to: 'uttamviradiya.initiotechmedia.14@gmail.com',
    subject: 'Test Email from Bahath Jobz SMTP',
    text: 'This is a test email for OTP verification using Office365 SMTP.',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
  } catch (err) {
    console.error('❌ Email error:', err);
  }
}

sendTestMail();
