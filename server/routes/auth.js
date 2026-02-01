// server/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import {authenticateToken, generateToken } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import passport from '../middleware/passport.js';
import sendEmail from '../utils/sendmail.js';

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

/// Utility: generate 6-digit OTP
function generateOTP() {
  // return Math.floor(100000 + Math.random() * 900000).toString();
   return '1234';
}

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, country, interests } = req.body;

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists with this email' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data
    const userData = {
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        country,
    };

    // Add interests for job seekers
    if (role === 'job_seeker' && interests && Array.isArray(interests) && interests.length > 0) {
      userData.interests = interests;
      userData.interests_selected = true;
    } else if (role === 'job_seeker') {
      userData.interests_selected = false;
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
    });

    // Generate JWT
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        country: user.country,
        interests: user.interests,
        interests_selected: user.interests_selected,
      },
    });
  } catch (err) {
    console.error('🚨 Registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

router.post('/send-otp', async (req, res) => {
    try {
      const { email } = req.body;
  
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
      // Save OTP to the database
      await prisma.otp.create({
        data: {
          email,
          otp,
          expiresAt,
        },
      });
  
      // Send OTP email
      const subject = 'Your Bahath Jobz Verification OTP';
      const html = `
        <h2>Hello!</h2>
        <p>Your OTP for verification is: <b>${otp}</b></p>
        <p>It will expire in 10 minutes.</p>
      `;
  
      const mailStatus = await sendEmail({
        to: email,
        subject,
        html,
      });
  
      if (mailStatus.success) {
        console.log(`✅ OTP email sent to ${email} successfully`);
        res.status(200).json({ message: 'OTP sent successfully' });
      } else {
        console.log(`❌ OTP email failed for ${email}: ${mailStatus.error}`);
        res.status(500).json({ message: 'Failed to send OTP' });
      }
    } catch (err) {
      console.error('🚨 Send OTP error:', err);
      res.status(500).json({ message: 'Failed to send OTP', error: err.message });
    }
  });

  router.post('/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      // Find the OTP in the database
      const otpRecord = await prisma.otp.findFirst({
        where: {
          email,
          otp,
        },
      });
  
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      // Check if the OTP has expired
      if (new Date() > new Date(otpRecord.expiresAt)) {
        return res.status(400).json({ message: 'OTP has expired' });
      }
  
      // Delete the OTP from the database
      await prisma.otp.delete({
        where: {
          id: otpRecord.id,
        },
      });
  
      res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err) {
      console.error('🚨 Verify OTP error:', err);
      res.status(500).json({ message: 'Failed to verify OTP', error: err.message });
    }
  });



// Start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = generateToken(req.user.id);

    // Redirect to frontend with token in query params
    const frontendURL = 'https://bahathjobz.com'; // your frontend URL
    res.redirect(`${frontendURL}/auth/google/callback?token=${token}`);
  }
);


// Register
// router.post('/register', async (req, res) => {
//   try {
//     const { firstName, lastName, email, password, role, phone ,country} = req.body;


//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists with this email' });
//     }

//     // Hash password
//     const saltRounds = 12;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Create user in DB
//     const user = await prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword, 
//         first_name: firstName,
//         last_name: lastName,
//         phone,
//         role,
//         country,
//       },
//     });

//      // Generate OTP
//     const otp = generateOTP();

//     // Send OTP email
//     const mailOptions = {
//       from: `"Bahath Jobz" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Your Registration OTP',
//       html: `
//         <h2>Welcome, ${firstName}!</h2>
//         <p>Your OTP for registration is: <strong>${otp}</strong></p>
//         <p>It is valid for 10 minutes.</p>
//       `,
//     };

//     try {
//       await transporter.sendMail(mailOptions);
//       console.log(`OTP sent to ${email}: ${otp}`);
//       // Optionally, save OTP in DB for verification later
//       // await prisma.otp.create({ data: { userId: user.id, otp, expiresAt: new Date(Date.now() + 10*60*1000) } });
//     } catch (emailError) {
//       console.error('Failed to send OTP:', emailError);
//     }


//     // Generate token
//     const token = generateToken(user.id);

//     //  try {
//     //   await sendEmail({
//     //     to: user.email,
//     //     subject: 'Welcome to Veggi-Go!',
//     //     html: `
//     //       <h1>Welcome, ${user.first_name}!</h1>
//     //       <p>Thank you for registering at <strong>Veggi-Go</strong>. We're excited to have you on board!</p>
//     //       <p>You can now log in and start using our platform.</p>
//     //       <p>Best regards,<br>Veggi-Go Team</p>
//     //     `,
//     //   });
//     //   console.log('Welcome email sent to', user.email);
//     // } catch (emailError) {
//     //   console.error('Failed to send welcome email:', emailError);
//     //   // Not returning an error here, because registration should succeed even if email fails
//     // }

//     res.status(201).json({
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         firstName: user.first_name,
//         lastName: user.last_name,
//         phone: user.phone,
//         role: user.role,
//         avatar: user.avatar,
//         isActive: user.is_active,
//         createdAt: user.created_at,
//         country: user.country,
//       },
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: 'Registration failed' });
//   } 
// });

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const user = await prisma.user.findFirst({
      where: {
        email,
        is_active: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If user has no password, they should use Google to log in
    if (!user.password) {
      return res.status(401).json({ message: 'You have registered using a social account. Please use Google to log in.' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isActive: user.is_active,
        createdAt: user.created_at,
        interests: user.interests,
        interests_selected: user.interests_selected,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});




//  server/routes/auth.js
// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isActive: user.is_active,
      createdAt: user.created_at,
      interests: user.interests,
      interests_selected: user.interests_selected,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});
// router.post('/change-password', authenticateToken, async (req, res) => {
//   try {
//     const { oldPassword, newPassword } = req.body;
//     const userId = req.user.id;

//     // Get user from Prisma
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check old password
//     const validPassword = await bcrypt.compare(oldPassword, user.password);
//     if (!validPassword) {
//       return res.status(401).json({ message: 'Invalid old password' });
//     }

//     // Hash new password
//     const saltRounds = 12;
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Update password
//     await prisma.user.update({
//       where: { id: userId },
//       data: { password: hashedPassword },
//     });

//     res.json({ message: 'Password changed successfully' });
//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({ message: 'Failed to change password' });
//   }
// });
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword, phone, country } = req.body;
    const userId = req.user.id;

    // Get user from Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check old password
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid old password' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Prepare update data
    const updateData = {
      password: hashedPassword,
    };

    if (phone !== undefined) updateData.phone = phone;
    if (country !== undefined) updateData.country = country;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      message: 'Password (and user info) updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        country: updatedUser.country,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Update user interests (for job seekers)
router.patch('/update-interests', authenticateToken, async (req, res) => {
  try {
    const { interests } = req.body;
    const userId = req.user.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate interests
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ message: 'Please select at least one interest' });
    }

    // Update user interests
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        interests: interests,
        interests_selected: true,
      },
    });

    res.json({
      message: 'Interests updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        interests: updatedUser.interests,
        interests_selected: updatedUser.interests_selected,
      },
    });
  } catch (error) {
    console.error('Update interests error:', error);
    res.status(500).json({ message: 'Failed to update interests', error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const activeJobs = await prisma.job.count({
      where: { is_approved: true },
    });

    const jobSeekers = await prisma.user.count({
      where: { role: 'job_seeker' },
    });

    const companies = await prisma.company.count();

    res.json({
      activeJobs,
      jobSeekers,
      companies,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// ==========================================
// FORGOT PASSWORD - Send reset link via email
// ==========================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    }

    // Check if user registered via Google (no password)
    if (!user.password && user.googleId) {
      return res.status(400).json({ 
        message: 'This account uses Google Sign-In. Please login with Google.' 
      });
    }

    // Generate a secure random token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate any existing tokens for this user
    await prisma.password_reset_token.updateMany({
      where: { 
        user_id: user.id,
        used: false 
      },
      data: { used: true }
    });

    // Create new reset token
    await prisma.password_reset_token.create({
      data: {
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt,
      },
    });

    // Build reset URL
    const frontendURL = process.env.FRONTEND_URL || 'https://bahathjobz.com';
    const resetURL = `${frontendURL}/auth/reset-password?token=${resetToken}`;

    // Send email
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Bahath Jobz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">BAHATH JOBZ</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Password Reset Request</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Hello ${user.first_name},
            </p>
            <p style="color: #4b5563; font-size: 16px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" 
                 style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in <strong>1 hour</strong>.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this, you can safely ignore this email. Your password won't be changed.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetURL}" style="color: #2563eb;">${resetURL}</a>
            </p>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} Bahath Jobz. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Hello ${user.first_name},\n\nWe received a request to reset your password.\n\nClick here to reset: ${resetURL}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
    });

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    console.log(`✅ Password reset email sent to ${user.email}`);
    res.status(200).json({ 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });

  } catch (error) {
    console.error('🚨 Forgot password error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// ==========================================
// VERIFY RESET TOKEN - Check if token is valid
// ==========================================
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valid: false, message: 'Token is required' });
    }

    const resetToken = await prisma.password_reset_token.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired reset link' });
    }

    if (resetToken.used) {
      return res.status(400).json({ valid: false, message: 'This reset link has already been used' });
    }

    if (new Date() > resetToken.expires_at) {
      return res.status(400).json({ valid: false, message: 'This reset link has expired' });
    }

    res.status(200).json({ 
      valid: true, 
      message: 'Token is valid',
      email: resetToken.user.email 
    });

  } catch (error) {
    console.error('🚨 Verify reset token error:', error);
    res.status(500).json({ valid: false, message: 'Something went wrong' });
  }
});

// ==========================================
// RESET PASSWORD - Set new password
// ==========================================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find the reset token
    const resetToken = await prisma.password_reset_token.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    if (resetToken.used) {
      return res.status(400).json({ message: 'This reset link has already been used' });
    }

    if (new Date() > resetToken.expires_at) {
      return res.status(400).json({ message: 'This reset link has expired. Please request a new one.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user_id },
        data: { password: hashedPassword }
      }),
      prisma.password_reset_token.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ]);

    // Send confirmation email
    await sendEmail({
      to: resetToken.user.email,
      subject: 'Password Changed Successfully - Bahath Jobz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">BAHATH JOBZ</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Password Changed Successfully</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Hello ${resetToken.user.first_name},
            </p>
            <p style="color: #4b5563; font-size: 16px;">
              Your password has been successfully changed. You can now log in with your new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://bahathjobz.com'}/auth/login" 
                 style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Login Now
              </a>
            </div>
            <p style="color: #ef4444; font-size: 14px;">
              <strong>If you didn't make this change</strong>, please contact us immediately or reset your password again.
            </p>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} Bahath Jobz. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Hello ${resetToken.user.first_name},\n\nYour password has been successfully changed.\n\nIf you didn't make this change, please contact us immediately.`,
    });

    console.log(`✅ Password reset successful for ${resetToken.user.email}`);
    res.status(200).json({ message: 'Password has been reset successfully. You can now login.' });

  } catch (error) {
    console.error('🚨 Reset password error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

export default router;