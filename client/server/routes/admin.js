import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import db from '../database/database.js';

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// Get dashboard analytics
router.get('/analytics', (req, res) => {
  try {
    // Get total counts
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalEmployers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "employer"').get().count;
    const totalJobs = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE is_active = 1').get().count;
    const totalApplications = db.prepare('SELECT COUNT(*) as count FROM job_applications').get().count;

    // Get daily activity for the last 7 days
    const dailyActivity = db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date
    `).all();

    // Get monthly activity for the last 12 months
    const monthlyActivity = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month
    `).all();

    res.json({
      totalUsers,
      totalEmployers,
      totalJobs,
      totalApplications,
      dailyActivity,
      monthlyActivity
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get all users with pagination
router.get('/users', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const role = req.query.role || '';
    const status = req.query.status || '';
    const search = req.query.search || '';

    let query = `
      SELECT id, email, first_name, last_name, phone, role, avatar, is_active, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (status === 'active') {
      query += ' AND is_active = 1';
    } else if (status === 'inactive') {
      query += ' AND is_active = 0';
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const users = db.prepare(query).all(...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
    const countParams = [];
    
    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (status === 'active') {
      countQuery += ' AND is_active = 1';
    } else if (status === 'inactive') {
      countQuery += ' AND is_active = 0';
    }

    if (search) {
      countQuery += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const total = db.prepare(countQuery).get(...countParams).count;

    res.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isActive: user.is_active,
        createdAt: user.created_at
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user status
router.patch('/users/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const stmt = db.prepare('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(isActive ? 1 : 0, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Get all companies for moderation
router.get('/companies', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const approved = req.query.approved;

    let query = `
      SELECT c.*, u.first_name, u.last_name, u.email
      FROM companies c
      JOIN users u ON c.employer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (approved === 'true') {
      query += ' AND c.is_approved = 1';
    } else if (approved === 'false') {
      query += ' AND c.is_approved = 0';
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const companies = db.prepare(query).all(...params);
    
    res.json({ companies });
  } catch (error) {
    console.error('Companies fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

// Approve/reject company
router.patch('/companies/:id/approval', (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const stmt = db.prepare('UPDATE companies SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(isApproved ? 1 : 0, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company approval status updated successfully' });
  } catch (error) {
    console.error('Company approval error:', error);
    res.status(500).json({ message: 'Failed to update company approval' });
  }
});

// Get all jobs for moderation
router.get('/jobs', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const approved = req.query.approved;

    let query = `
      SELECT j.*, c.name as company_name, u.first_name, u.last_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      JOIN users u ON j.employer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (approved === 'true') {
      query += ' AND j.is_approved = 1';
    } else if (approved === 'false') {
      query += ' AND j.is_approved = 0';
    }

    query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const jobs = db.prepare(query).all(...params);
    
    res.json({ jobs });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Approve/reject job
router.patch('/jobs/:id/approval', (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const stmt = db.prepare('UPDATE jobs SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(isApproved ? 1 : 0, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job approval status updated successfully' });
  } catch (error) {
    console.error('Job approval error:', error);
    res.status(500).json({ message: 'Failed to update job approval' });
  }
});

export default router;