import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import db from '../database/database.js';

const router = express.Router();

// Create/Update job seeker profile
router.post('/job-seeker', authenticateToken, requireRole(['job_seeker']), upload.single('resume'), (req, res) => {
  try {
    const profileData = req.body;
    const userId = req.user.id;

    const resumeUrl = req.file ? req.file.path : null;

    // Check if profile exists
    const existingProfile = db.prepare('SELECT * FROM job_seekers WHERE user_id = ?').get(userId);

    if (existingProfile) {
      // Update existing profile
      const stmt = db.prepare(`
        UPDATE job_seekers SET
          summary = ?, availability = ?, education = ?, experience = ?,
          skills = ?, resume_url = COALESCE(?, resume_url), location = ?,
          visa_status = ?, portfolio_url = ?, linkedin_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);

      stmt.run(
        profileData.summary,
        profileData.availability,
        profileData.education,
        profileData.experience,
        JSON.stringify(profileData.skills || []),
        resumeUrl,
        profileData.location,
        profileData.visaStatus,
        profileData.portfolioUrl,
        profileData.linkedinUrl,
        userId
      );
    } else {
      // Create new profile
      const stmt = db.prepare(`
        INSERT INTO job_seekers (
          user_id, summary, availability, education, experience,
          skills, resume_url, location, visa_status, portfolio_url, linkedin_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        userId,
        profileData.summary,
        profileData.availability,
        profileData.education,
        profileData.experience,
        JSON.stringify(profileData.skills || []),
        resumeUrl,
        profileData.location,
        profileData.visaStatus,
        profileData.portfolioUrl,
        profileData.linkedinUrl
      );
    }

    // Get updated profile
    const profile = db.prepare('SELECT * FROM job_seekers WHERE user_id = ?').get(userId);

    res.json({
      message: 'Profile updated successfully',
      profile: {
        ...profile,
        skills: JSON.parse(profile.skills || '[]')
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get job seeker profile
router.get('/job-seeker/me', authenticateToken, requireRole(['job_seeker']), (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = db.prepare('SELECT * FROM job_seekers WHERE user_id = ?').get(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      ...profile,
      skills: JSON.parse(profile.skills || '[]')
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Search job seekers (employer only)
router.get('/job-seekers/search', authenticateToken, requireRole(['employer']), (req, res) => {
  try {
    const { location, skills, education, visaStatus, experience } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let query = `
      SELECT 
        js.*,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar
      FROM job_seekers js
      JOIN users u ON js.user_id = u.id
      WHERE u.is_active = 1
    `;
    const params = [];

    if (location) {
      query += ' AND js.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (skills) {
      query += ' AND js.skills LIKE ?';
      params.push(`%${skills}%`);
    }

    if (education) {
      query += ' AND js.education LIKE ?';
      params.push(`%${education}%`);
    }

    if (visaStatus) {
      query += ' AND js.visa_status = ?';
      params.push(visaStatus);
    }

    if (experience) {
      query += ' AND js.experience LIKE ?';
      params.push(`%${experience}%`);
    }

    query += ' ORDER BY js.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const profiles = db.prepare(query).all(...params);

    res.json({
      profiles: profiles.map(profile => ({
        ...profile,
        skills: JSON.parse(profile.skills || '[]')
      }))
    });
  } catch (error) {
    console.error('Job seeker search error:', error);
    res.status(500).json({ message: 'Failed to search job seekers' });
  }
});

export default router;