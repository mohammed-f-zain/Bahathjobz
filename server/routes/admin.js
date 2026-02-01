import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// Get dashboard analytics

// Dashboard analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    // Total counts
    const totalUsers = await prisma.user.count({
      where: { role: 'job_seeker' }
    });
    const totalEmployers = await prisma.user.count({
      where: { role: 'employer' }
    });
    const totalJobs = await prisma.job.count({
      where: { is_active: true }
    });
    const totalApplications = await prisma.job_application.count();

    // Dates for queries
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Daily activity for last 7 days
    const dailyActivityRaw = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM "user"
      WHERE created_at >= ${sevenDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    const dailyActivity = dailyActivityRaw.map(item => ({
      date: item.date,
      count: Number(item.count)
    }));

    // Monthly activity for last 12 months
    const monthlyActivityRaw = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM "user"
      WHERE created_at >= ${twelveMonthsAgo}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `;

    const monthlyActivity = monthlyActivityRaw.map(item => ({
      month: item.month,
      count: Number(item.count)
    }));

    // Send response
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
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const role = req.query.role || '';
    const status = req.query.status || '';
    const search = req.query.search || '';

    const where = {
      ...(role && { role }),
      ...(status === 'active' && { is_active: true }),
      ...(status === 'inactive' && { is_active: false }),
      ...(search && {
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        avatar: true,
        is_active: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
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
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { is_active }
    });

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    console.error('User status update error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        data: null,
      });
    }

    const deletedUser = { ...user };

    await prisma.$transaction(async (tx) => {
      if (user.role === 'job_seeker') {
        const jobSeekerProfile = await tx.job_seeker.findUnique({
          where: { user_id: id },
          select: { id: true },
        });

        if (jobSeekerProfile) {
          await tx.career_history.deleteMany({
            where: { job_seeker_id: jobSeekerProfile.id },
          });
          await tx.job_seeker.delete({
            where: { id: jobSeekerProfile.id },
          });
        }
        await tx.job_application.deleteMany({
          where: { job_seeker_id: id },
        });
      } else if (user.role === 'employer') {
        const companies = await tx.company.findMany({
          where: { employer_id: id },
          select: { id: true },
        });
        const companyIds = companies.map((c) => c.id);

        const jobs = await tx.job.findMany({
          where: {
            OR: [{ employer_id: id }, { company_id: { in: companyIds } }],
          },
          select: { id: true },
        });
        const jobIds = jobs.map((j) => j.id);

        if (jobIds.length > 0) {
          await tx.job_application.deleteMany({
            where: { job_id: { in: jobIds } },
          });
          await tx.engagement.deleteMany({
            where: { job_id: { in: jobIds } },
          });
          await tx.liked_job.deleteMany({
            where: { job_id: { in: jobIds } },
          });
          await tx.job.deleteMany({ where: { id: { in: jobIds } } });
        }

        if (companyIds.length > 0) {
          await tx.company.deleteMany({ where: { id: { in: companyIds } } });
        }
      }

      // Delete common associated data
      await tx.liked_job.deleteMany({ where: { user_id: id } });
      await tx.engagement.deleteMany({ where: { user_id: id } });
      await tx.notification.deleteMany({ where: { user_id: id } });
      await tx.blog_post.deleteMany({ where: { author_id: id } });

      // Finally, delete the user
      await tx.user.delete({ where: { id } });
    });
    const responseData = {
      user: deletedUser,
    };

    if (user.role === 'employer') {
       responseData.deletedCompanies = deletedUser.deletedCompanies;
      responseData.deletedJobs = deletedUser.deletedJobs;
    }

    res.status(200).json({
      status: 'success',
      message: 'User and their related data deleted successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      data: null,
    });
  }
});




// Get all companies for moderation
router.get('/companies', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const approved = req.query.approved;

    const where = {
      ...(approved === 'true' && { is_approved: true }),
      ...(approved === 'false' && { is_approved: false })
    };

    const companies = await prisma.company.findMany({
      where,
      include: {
        employer: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        },
        jobs: true 
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    res.json({ 
      companies: companies.map(company => ({
        ...company,
        first_name: company.employer.first_name,
        last_name: company.employer.last_name,
        email: company.employer.email,
        totalJobs: company.jobs.length,
    activeJobs: company.jobs.filter(j => j.is_approved).length
      }))
    });
  } catch (error) {
    console.error('Companies fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

// Approve/reject company
router.patch('/companies/:id/approval', async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    // console.log('Request Body:', req.body);

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'isApproved must be boolean' });
    }

    // Check company exists
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Update DB
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { is_approved: isApproved }
    });

    // console.log('Updated Company:', updatedCompany);

    res.json({
      message: 'Company approval status updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    // console.error('Company approval error:', error);
    res.status(500).json({ message: 'Failed to update company approval' });
  }
});


// Get all jobs for moderation
router.get('/jobs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const approved = req.query.approved;
    const search = req.query.search;
    

      const where = {
      ...(approved === 'true' && { is_approved: true }),
      ...(approved === 'false' && { is_approved: false }),
      ...(search && { 
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { name: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    // Get total count (for pagination)
    const totalCount = await prisma.job.count({ where });

    // Fetch jobs with pagination
    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: { select: { name: true } },
        employer: { select: { first_name: true, last_name: true } }
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    res.json({
      jobs: jobs.map(job => ({
        ...job,
        company_name: job.company.name,
        first_name: job.employer.first_name,
        last_name: job.employer.last_name
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
});



// Approve/reject job
router.patch('/jobs/:id/approval', async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    // Validate input
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'isApproved must be boolean' });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({ 
      where: { id },
      include: { company: true }
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Update job approval status
    const updatedJob = await prisma.job.update({
      where: { id },
      data: { is_approved: isApproved }
    });

    // Send email notifications AFTER approval (only if job was just approved and notifications are enabled)
    if (isApproved && !job.is_approved && updatedJob.send_email_notification && 
        updatedJob.notification_interests && Array.isArray(updatedJob.notification_interests) && 
        updatedJob.notification_interests.length > 0) {
      // Send notifications asynchronously (don't wait for it)
      const { sendJobNotificationEmails } = await import('../utils/jobNotifications.js');
      sendJobNotificationEmails(updatedJob, job.company).catch((error) => {
        console.error('Failed to send job notification emails:', error);
        // Don't fail the approval if email sending fails
      });
    }

    res.json({
      message: 'Job approval status updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Job approval error:', error);
    res.status(500).json({ message: 'Failed to update job approval' });
  }
});


// Approve/reject job
router.patch('/company/:id/approval', async (req, res) => {
  try {
    const { id } = req.params;             // company ID
    const { isApproved } = req.body;       // JSON input: { "isApproved": false }

    // Validate input
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'isApproved must be a boolean' });
    }

    // Update the company's approval status
    const updatedCompany = await prisma.company.update({
      where: { id },                       // use id from URL
      data: { is_approved: isApproved }    // map camelCase JSON to snake_case DB
    });

    res.json({
      message: 'Company approval status updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Company not found' });
    }
    console.error('Company approval error:', error);
    res.status(500).json({ message: 'Failed to update company approval' });
  }
});


router.get("/engagements", async (req, res) => {
  try {
    const engagements = await prisma.engagement.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        job: {
          include: {
            company: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
 
    res.json({ engagements });
  } catch (error) {
    console.error("Engagements fetch error:", error);
    res.status(500).json({ message: "Failed to fetch engagements" });
  }
});
 
/**
 * 2) Get engagements with pagination, filter by status & search
 */
router.get("/engagements/paginated", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "";
    const search = req.query.search || "";
 
    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { content: { contains: search, mode: "insensitive" } },
          {
            user: {
              OR: [
                { first_name: { contains: search, mode: "insensitive" } },
                { last_name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
          },
          { job: { title: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };
 
    const engagements = await prisma.engagement.findMany({
      where,
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        job: {
          include: {
            company: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
 
    const total = await prisma.engagement.count({ where });
 
    res.json({
      engagements: engagements.map((e) => ({
        ...e,
        first_name: e.user.first_name,
        last_name: e.user.last_name,
        company_name: e.job.company?.name || null,
        job_title: e.job.title,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Engagements fetch error:", error);
    res.status(500).json({ message: "Failed to fetch engagements" });
  }
});
 
/**
 * 3) Update engagement status
 */
router.patch("/engagements/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
 
    const updated = await prisma.engagement.update({
      where: { id },
      data: { status },
    });
 
    res.json({ message: "Engagement status updated successfully", updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Engagement not found" });
    }
    console.error("Engagement status update error:", error);
    res.status(500).json({ message: "Failed to update engagement status" });
  }
});

export default router;