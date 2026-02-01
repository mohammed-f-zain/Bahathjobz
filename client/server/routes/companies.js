import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import db from '../database/database.js';

const router = express.Router();

// Create company profile (employer only)
router.post('/', authenticateToken, requireRole(['employer']), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), (req, res) => {
  try {
    const companyData = req.body;
    const employerId = req.user.id;

    // Check if employer already has a company
    const existingCompany = db.prepare('SELECT * FROM companies WHERE employer_id = ?').get(employerId);
    if (existingCompany) {
      return res.status(400).json({ message: 'You already have a company profile' });
    }

    const logoPath = req.files?.logo ? req.files.logo[0].path : null;
    const bannerPath = req.files?.banner ? req.files.banner[0].path : null;

    const stmt = db.prepare(`
      INSERT INTO companies (
        name, logo, banner, tagline, description, industry, website,
        location, contact_email, contact_phone, employer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      companyData.name,
      logoPath,
      bannerPath,
      companyData.tagline,
      companyData.description,
      companyData.industry,
      companyData.website,
      companyData.location,
      companyData.contactEmail,
      companyData.contactPhone,
      employerId
    );

    const company = db.prepare('SELECT * FROM companies WHERE rowid = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Company profile created successfully. It will be reviewed by our team.',
      company
    });
  } catch (error) {
    console.error('Company creation error:', error);
    res.status(500).json({ message: 'Failed to create company profile' });
  }
});

// Get company profile
router.get('/me', authenticateToken, requireRole(['employer']), (req, res) => {
  try {
    const employerId = req.user.id;
    
    const company = db.prepare('SELECT * FROM companies WHERE employer_id = ?').get(employerId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Company fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch company profile' });
  }
});

// Update company profile
router.put('/me', authenticateToken, requireRole(['employer']), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), (req, res) => {
  try {
    const companyData = req.body;
    const employerId = req.user.id;

    const company = db.prepare('SELECT * FROM companies WHERE employer_id = ?').get(employerId);
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const logoPath = req.files?.logo ? req.files.logo[0].path : company.logo;
    const bannerPath = req.files?.banner ? req.files.banner[0].path : company.banner;

    const stmt = db.prepare(`
      UPDATE companies SET
        name = ?, logo = ?, banner = ?, tagline = ?, description = ?,
        industry = ?, website = ?, location = ?, contact_email = ?,
        contact_phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE employer_id = ?
    `);

    stmt.run(
      companyData.name || company.name,
      logoPath,
      bannerPath,
      companyData.tagline || company.tagline,
      companyData.description || company.description,
      companyData.industry || company.industry,
      companyData.website || company.website,
      companyData.location || company.location,
      companyData.contactEmail || company.contact_email,
      companyData.contactPhone || company.contact_phone,
      employerId
    );

    const updatedCompany = db.prepare('SELECT * FROM companies WHERE employer_id = ?').get(employerId);

    res.json({
      message: 'Company profile updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Company update error:', error);
    res.status(500).json({ message: 'Failed to update company profile' });
  }
});

// Get all approved companies (public)
router.get('/all', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const industry = req.query.industry || '';

    let query = `
      SELECT * FROM companies
      WHERE is_approved = 1
    `;
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    if (industry) {
      query += ' AND industry = ?';
      params.push(industry);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const companies = db.prepare(query).all(...params);

    res.json({ companies });
  } catch (error) {
    console.error('Companies fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

export default router;