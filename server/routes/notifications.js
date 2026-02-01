import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
// import prisma from '../lib/prisma.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();


/* -------------------- Create Notification -------------------- */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // use ID from token
    const { title, message, type } = req.body;

    // console.log("Incoming create notification request");
    // console.log("User ID (from token):", userId);
    // console.log("Request Body:", req.body);

    if (!title || !message || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const notification = await prisma.notification.create({
      data: {
        user_id: userId,   // always use token ID
        title,
        message,
        type,
      },
    });

    // console.log("Notification created:", notification);

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    // console.error("Notification create error:", error);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

/* -------------------- Get Notifications -------------------- */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // console.log("Incoming request for notifications:");
    // console.log("User ID:", userId);
    // console.log("Page:", page, "Limit:", limit);

    const total = await prisma.notification.count({ where: { user_id: userId } });

    const skip = (page - 1) * limit;
    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    });

    const unreadCount = await prisma.notification.count({
      where: { user_id: userId, is_read: false }
    });

    // console.log("Fetched notifications:", notifications.length);
    // console.log("Total count:", total, "Unread count:", unreadCount);

    res.json({
      notifications,
      unreadCount,
      page,
      limit,
      total
    });
  } catch (error) {
    // console.error('Notifications fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// ================================
// Mark Single Notification as Read
// ================================
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('Mark notification as read request received');
    console.log('Notification ID:', id, 'User ID:', userId);

    const result = await prisma.notification.updateMany({
      where: { id, user_id: userId },
      data: { is_read: true },
    });

    console.log('Update result:', result);

    if (result.count === 0) {
      return res.status(404).json({ message: 'Notification not found for this user' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({ message: 'Something went wrong!', error: error.message });
  }
});

// ================================
// Mark All Notifications as Read
// ================================
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    console.log('Mark all read result:', result);

    res.json({ message: 'All notifications marked as read', updated: result.count });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read', error: error.message });
  }
});

export default router;