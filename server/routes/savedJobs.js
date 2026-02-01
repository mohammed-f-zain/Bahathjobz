// api/savedJobs.js
import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /api/saved-jobs
 * Get all saved jobs for the logged-in job seeker
 */
router.get('/', authenticateToken, requireRole(['job_seeker']), async (req, res) => {
      console.log("👉 GET /api/saved-jobs hit");

  try {
    const userId = req.user.id;

    const saved = await prisma.engagement.findMany({
      where: {
        user_id: userId,
        type: { in: ['favorite', 'bookmark'] },
      },
      include: {
        job: {
          include: {
            company: {
              select: { name: true, logo: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log('Raw saved engagements:', saved);

    const savedJobs = saved.map((eng) => ({
      id: eng.job.id,
      title: eng.job.title,
      company_name: eng.job.company.name,
      company_logo: eng.job.company.logo,
      location: eng.job.location,
      work_type: eng.job.work_type,
      seniority: eng.job.seniority,
      industry: eng.job.industry,
      salary_min: eng.job.salary_min,
      salary_max: eng.job.salary_max,
      saved_at: eng.created_at,
      type: eng.type
    }));
    console.log('Fetched saved jobs:', savedJobs);
    res.json({ savedJobs });
  } catch (error) {
    console.error('Fetch saved jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch saved jobs' });
  }
});

/**
 * POST /api/saved-jobs
 * Save a job (favorite or bookmark)
 */
router.post('/', authenticateToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { job_id, type } = req.body;

    if (!['favorite', 'bookmark'].includes(type)) {
      return res.status(400).json({ message: 'Invalid save type' });
    }

    // Prevent duplicates
    const existing = await prisma.engagement.findFirst({
      where: { user_id: userId, job_id, type }
    });

    if (existing) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    const engagement = await prisma.engagement.create({
      data: {
        job_id,
        user_id: userId,
        type,
        //  content
      }
    });

    res.status(201).json({ message: 'Job saved successfully', engagement });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Failed to save job' });
  }
});

/**
 * PUT /api/saved-jobs/:jobId
 * Update saved job type (favorite ↔ bookmark)
 */
router.put('/:jobId', authenticateToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const { type } = req.body;

    if (!['favorite', 'bookmark'].includes(type)) {
      return res.status(400).json({ message: 'Invalid save type' });
    }

    const engagement = await prisma.engagement.findFirst({
      where: { job_id: jobId, user_id: userId }
    });

    if (!engagement) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    const updated = await prisma.engagement.update({
      where: { id: engagement.id },
      data: { type }
    });

    res.json({ message: 'Saved job updated', engagement: updated });
  } catch (error) {
    console.error('Update saved job error:', error);
    res.status(500).json({ message: 'Failed to update saved job' });
  }
});

/**
 * DELETE /api/saved-jobs/:jobId
 * Remove saved job
 */
router.delete('/:jobId', authenticateToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const engagement = await prisma.engagement.findFirst({
      where: { job_id: jobId, user_id: userId }
    });

    if (!engagement) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    await prisma.engagement.delete({ where: { id: engagement.id } });

    res.json({ message: 'Job removed successfully' });
  } catch (error) {
    console.error('Delete saved job error:', error);
    res.status(500).json({ message: 'Failed to remove job' });
  }
});

export default router;
