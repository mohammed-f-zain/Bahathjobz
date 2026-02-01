import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import db from '../database/database.js';

const router = express.Router();

// Get applications for job seeker
router.get('/my-applications', authenticateToken, requireRole(['job_seeker']), (req, res) => {
  try {
    const jobSeekerId = req.user.id;
    
    const applications = db.prepare(`
      SELECT 
        ja.*,
        j.title as job_title,
        j.location as job_location,
        j.work_type,
        c.name as company_name,
        c.logo as company_logo
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE ja.job_seeker_id = ?
      ORDER BY ja.applied_at DESC
    `).all(jobSeekerId);

    res.json({ applications });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Get applications for employer
router.get('/employer', authenticateToken, requireRole(['employer']), (req, res) => {
  try {
    const employerId = req.user.id;
    const jobId = req.query.jobId;
    
    let query = `
      SELECT 
        ja.*,
        j.title as job_title,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        js.summary,
        js.experience,
        js.education,
        js.resume_url
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN users u ON ja.job_seeker_id = u.id
      LEFT JOIN job_seekers js ON u.id = js.user_id
      WHERE j.employer_id = ?
    `;
    const params = [employerId];

    if (jobId) {
      query += ' AND j.id = ?';
      params.push(jobId);
    }

    query += ' ORDER BY ja.applied_at DESC';

    const applications = db.prepare(query).all(...params);

    res.json({ applications });
  } catch (error) {
    console.error('Employer applications fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Update application status (employer only)
router.patch('/:id/status', authenticateToken, requireRole(['employer']), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const employerId = req.user.id;

    // Verify the application belongs to this employer's job
    const application = db.prepare(`
      SELECT ja.*, j.employer_id, j.title as job_title
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.id = ? AND j.employer_id = ?
    `).get(id, employerId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update status
    const stmt = db.prepare('UPDATE job_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, id);

    // Create notification for job seeker
    const notificationStmt = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `);

    const statusMessages = {
      under_review: 'Your application is under review',
      shortlisted: 'Congratulations! You have been shortlisted',
      rejected: 'Your application was not selected',
      hired: 'Congratulations! You have been hired'
    };

    notificationStmt.run(
      application.job_seeker_id,
      'Application Status Update',
      `${statusMessages[status]} for ${application.job_title}`,
      'application'
    );

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Application status update error:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

export default router;