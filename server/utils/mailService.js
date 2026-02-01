import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter for Outlook (Office365)
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,              // ✅ correct port
  secure: false,          // ✅ TLS, not SSL
  auth: {
    user: "inquiries@bahathjobz.com ",
    pass: "Thair@Qatar140166429778ub",
  },
  tls: {
    ciphers: "TLSv1.2",   // ✅ force modern TLS
    rejectUnauthorized: false,
  },
});


// Verify connection configuration (optional)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error);
  } else {
    console.log('✅ SMTP Server Ready to Send Emails');
  }
});

/**
 * Send email (returns true if sent successfully, false otherwise)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"Bahath Jobz" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email successfully sent to ${to} — Message ID: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error(`🚨 Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};
