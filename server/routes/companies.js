// server/routes/companies.js
import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import path from "path";
// import prisma from '../lib/prisma.js';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();
const VITE_IMAGE_URL = process.env.VITE_IMAGE_URL || 'http://localhost:3001';

// Create company profile (employer only)
router.post('/', authenticateToken, requireRole(['employer']), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  try {
    const companyData = req.body;
    const employer_id = req.user.id;


    console.log(VITE_IMAGE_URL, 'VITE_IMAGE_URL');
    // Check if employer already has a company
    const existingCompany = await prisma.company.findFirst({
      where: { employer_id }
    });

    if (existingCompany) {
      return res.status(400).json({ message: 'You already have a company profile' });
    }

    
    const logoFileName = req.files.logo[0].filename
    ? req.files.logo[0].filename // already just "test.png"
    : null;

    const bannerFileName = req.files?.banner
      ? req.files.banner[0].filename
      : null;

    const logoPath = (logoFileName) ? VITE_IMAGE_URL + '/uploads/company/' + logoFileName : null;
    const bannerPath = (bannerFileName) ? VITE_IMAGE_URL + '/uploads/company/' + bannerFileName : null;


    const createData = {
      name: companyData.name,
      logo: logoPath,
      banner: bannerPath,
      tagline: companyData.tagline,
      description: companyData.description,
      industry: companyData.industry,
      website: companyData.website,
      location: companyData.location,
      contact_email: companyData.contact_email,
    contact_phone: companyData.contact_phone,
    employer_id: employer_id
    };

    console.log('Data sent to Prisma:', createData);

    const company = await prisma.company.create({ data: createData });

    console.log('Created company:', company);

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
router.get('/me', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const employer_id = req.user.id;
    console.log("Employer ID:", employer_id);
    const company = await prisma.company.findFirst({
      where: { employer_id }
    });
    
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
]), async (req, res) => {
  try {
    const companyData = req.body;
    const employer_id = req.user.id;

    const company = await prisma.company.findFirst({
      where: { employer_id }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    console.log(req.files, 'req.files');
    const logoFileName   = req.files.logo[0].filename
    ? req.files.logo[0].filename // already just "test.png"
    : company.logo;

    const bannerFileName = req.files?.banner
      ? req.files.banner[0].filename
      : company.banner;

    const logoPath = (logoFileName) ? VITE_IMAGE_URL + '/uploads/company/' + logoFileName : company.logo;
    const bannerPath = (bannerFileName) ? VITE_IMAGE_URL + '/uploads/company/' + bannerFileName : company.banner;


    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
    name: companyData.name || company.name,
    logo: logoPath,
    banner: bannerPath,
    tagline: companyData.tagline || company.tagline,
    description: companyData.description || company.description,
    industry: companyData.industry || company.industry,
    website: companyData.website || company.website,
    location: companyData.location || company.location,
    // contact_email: companyData.contactEmail || company.contact_email,
    // contact_phone: companyData.contactPhone || company.contact_phone
    contact_email: companyData.contactEmail || companyData.contact_email || company.contact_email,
contact_phone: companyData.contactPhone || companyData.contact_phone || company.contact_phone
      }
    });

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
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const industry = req.query.industry || '';

    const where = {
      is_approved: true,
      ...(search && { name: { contains: search } }),
      ...(industry && { industry })
    };

    const companies = await prisma.company.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    res.json({ companies });
  } catch (error) {
    console.error('Companies fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

export default router;