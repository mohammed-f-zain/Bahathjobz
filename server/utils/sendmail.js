import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Send email using Resend API (no SMTP port needed)
async function sendEmailWithResend({ to, subject, text, html }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    console.log('📧 Sending email via Resend API to:', to);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${process.env.MAIL_FROM_NAME || 'Bahath Jobz'} <${process.env.MAIL_FROM || 'noreply@bahathjobz.com'}>`,
        to: [to],
        subject: subject,
        html: html,
        text: text,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email sent successfully via Resend:', data.id);
      return { success: true, response: data.id };
    } else {
      console.error('❌ Resend API error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { success: false, error: error.message };
  }
}

// Send email using SMTP (Microsoft 365)
async function sendEmailWithSMTP({ to, subject, text, html }) {
  try {
    const smtpUser = process.env.SMTP_USER || 'contact@bahathjobz.com';

    console.log('📧 Attempting to send email via SMTP to:', to);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: "TLSv1.2",
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || 'Bahath Jobz'}" <${smtpUser}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('✅ Email sent successfully via SMTP:', info.response);
    return { success: true, response: info.response };
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Main function - uses Resend API (recommended for DigitalOcean)
async function sendEmail({ to, subject, text, html }) {
  // Use Resend API (works on DigitalOcean, no SMTP port needed)
  if (process.env.RESEND_API_KEY) {
    return sendEmailWithResend({ to, subject, text, html });
  }

  // If no Resend API key, show error
  console.error('❌ RESEND_API_KEY not configured. Please set it in your .env file');
  return {
    success: false,
    error: 'Email service not configured. Please set RESEND_API_KEY in .env file'
  };
}

export default sendEmail;
