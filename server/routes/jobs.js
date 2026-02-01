import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
// import prisma from '../lib/prisma.js';
import { PrismaClient } from '@prisma/client';
import { sendJobNotificationEmails } from '../utils/jobNotifications.js';

const prisma = new PrismaClient();

const router = express.Router();

// Get all jobs (public route with filters)
//{{bahathjobz}}jobs?page=1&limit=10
//{{bahathjobz}}jobs?page=1&limit=10&search=PHP&location=New%20York&industry=IT&work_type=Full-time&seniority=Senior
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search ? String(req.query.search) : '';
    const location = req.query.location ? String(req.query.location) : '';
    const industry = req.query.industry ? String(req.query.industry) : '';
    const work_type = req.query.work_type ? String(req.query.work_type) : '';
    const seniority = req.query.seniority ? String(req.query.seniority) : '';

    const where = {
      is_active: true,
      is_approved: true,
      company: {
        is: { is_approved: true }
      },
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { company: { is: { name: { contains: search, mode: 'insensitive' } } } }
        ]
      }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(industry && { industry: { contains: industry, mode: 'insensitive' } }),
      ...(work_type && { work_type: { contains: work_type, mode: 'insensitive' } }),
      ...(seniority && { seniority: { contains: seniority, mode: 'insensitive' } })
    };

    // console.log("WHERE clause:", JSON.stringify(where, null, 2));

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: {
          select: { name: true, logo: true }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.job.count({ where });

    res.json({
      jobs: jobs.map(job => ({
        ...job,
        company_name: job.company.name,
        company_logo: job.company.logo
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    // console.error('Jobs fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: { select: { name: true, logo: true, description: true, website: true } }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    // console.error('Job fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch job', error: error.message });
  }
});


// Create job (employer only)
router.post('/', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const jobData = req.body;
    const employer_id = req.user.id;

    // console.log('Logged in employer ID:', employer_id);
    // console.log('Job data received:', jobData);

    // Find the employer's company
    const company = await prisma.company.findFirst({
      where: { employer_id }
    });

    if (!company) {
      console.warn('No company found for employer:', employer_id);
      return res.status(400).json({
        message: 'You must create a company profile before posting jobs.'
      });
    }

    if (!company.is_approved) {
      console.warn('Company not approved:', company.id);
      return res.status(400).json({
        message: 'Your company profile is not approved yet. Jobs cannot be posted.'
      });
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        location: jobData.location,
        work_type: jobData.work_type,
        industry: jobData.industry,
        education: jobData.education,
        visa_eligible: jobData.visa_eligible || false,
        seniority: jobData.seniority,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        currency: jobData.currency || 'USD',
        company_id: company.id,
        employer_id,
        deadline: jobData.deadline ? new Date(jobData.deadline) : null,
        send_email_notification: jobData.send_email_notification || false,
        notification_interests: jobData.notification_interests || null,
      }
    });

    // Email notifications will be sent AFTER admin approval (see admin.js)
    // console.log('Job created successfully:', job.id);

    res.status(201).json({
      message: 'Job posted successfully. It will be reviewed by our team.',
      job
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
});

//Edit job (employer only)
router.put("/:id", authenticateToken, requireRole(["employer"]), async (req, res) => {
    //  console.log("POST /api/jobs/:id:", req.body);

  try {
    const { id } = req.params;
    const employer_id = req.user.id;
    const jobData = req.body;

    // console.log("=== Edit Job Request ===");
    // console.log("Job ID:", id);
    // console.log("Employer ID:", employer_id);
    // console.log("Received Data:", jobData);

    // check ownership
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        employer_id,
      },
    });

    if (!existingJob) {
      return res.status(404).json({ message: "Job not found or not owned by you" });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: jobData.title,
        description: jobData.description,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        location: jobData.location,
        work_type: jobData.work_type,
        industry: jobData.industry,
        education: jobData.education,
        visa_eligible: jobData.visa_eligible || false,
        seniority: jobData.seniority,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        currency: jobData.currency || "USD",
        deadline: jobData.deadline ? new Date(jobData.deadline) : null,
      },
    });

    res.json({
      message: "Job updated successfully.",
      job: updatedJob,
    });
  } catch (error) {
    //console.error("Job update error:", error);
    res.status(500).json({ message: "Failed to update job", error: error.message });
  }
});


// Get employer's jobs
router.get('/employer/my-jobs', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const employer_id = req.user.id;
    
    const jobs = await prisma.job.findMany({
      where: { employer_id },
      include: {
        company: {
          select: { name: true }
        },
        job_applications: {
          select: { id: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Calculate stats
    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.isActive && job.is_approved).length,
    totalApplications: jobs.reduce((sum, job) => sum + job.job_applications.length, 0),
      totalViews: 0 // Would need separate view tracking
    };

    res.json({ 
      jobs: jobs.map(job => ({
        ...job,
        company_name: job.company.name,
    application_count: job.job_applications.length,  // <-- correct relation
        view_count: 0
      })), 
      stats 
    });
  } catch (error) {
    console.error('Employer jobs fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch your jobs' });
  }
});

// Delete job (employer only)
router.delete('/:id', authenticateToken, requireRole(['employer', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    // 🔍 Find the job
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 🚫 Employers can delete only their own jobs
    if (role === 'employer' && job.employer_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this job' });
    }

    // 🗑️ 1. Delete related job applications
    await prisma.job_application.deleteMany({
      where: { job_id: id },
    });

    // 🗑️ 2. Delete related engagements
    await prisma.engagement.deleteMany({
      where: { job_id: id },
    });

    // 🗑️ 3. Delete the job itself
    await prisma.job.delete({
      where: { id },
    });

    res.json({ message: 'Job and related data deleted successfully' });
  } catch (error) {
    console.error('Job deletion error:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
});





// Apply for job (job seeker only)
router.post('/:id/apply', authenticateToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { coverNote } = req.body;
    const job_seeker_id = req.user.id;

    // console.log('Job ID:', jobId);
    // console.log('Job Seeker ID:', job_seeker_id);
    // console.log('Request Body:', req.body);

    const job = await prisma.job.findFirst({
      where: { 
        id: jobId,
        is_active: true
        // is_approved: true  // optional
      }
    });

    //console.log('Fetched Job:', job);

    if (!job) {
      //console.log('Job not found for ID:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingApplication = await prisma.job_application.findUnique({
      where: {
        job_id_job_seeker_id: {
          job_id: jobId,
          job_seeker_id
        }
      }
    });
    //console.log('Existing Application:', existingApplication);

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    //console.log('Creating application...');
    
    // Get job seeker details for email
    const jobSeeker = await prisma.user.findUnique({
      where: { id: job_seeker_id },
      include: {
        job_seeker: {
          select: {
            summary: true,
            experience: true,
            education: true
          }
        }
      }
    });

    // Get employer details for email
    const employer = await prisma.user.findUnique({
      where: { id: job.employer_id },
      select: {
        email: true,
        first_name: true,
        last_name: true
      }
    });

    // Get company details
    const company = await prisma.company.findUnique({
      where: { id: job.company_id },
      select: {
        name: true,
        logo: true
      }
    });

    // Create application
    await prisma.job_application.create({
      data: {
        job_id: jobId,
        job_seeker_id,
        cover_note: coverNote
      }
    });

    //console.log('Creating notification for employer...');
    await prisma.notification.create({
      data: {
        user_id: job.employer_id,
        title: 'New Job Application',
        message: `Someone applied for your job: ${job.title}`,
        type: 'application'
      }
    });

    // Count total applications for this job
    const totalApplications = await prisma.job_application.count({
      where: { job_id: jobId }
    });

    // Send email notification to employer only when we have 5, 10, 15, 20... applications
    const BATCH_SIZE = 5;
    if (employer && employer.email && totalApplications % BATCH_SIZE === 0) {
      // Get the last 5 applicants for the batch email
      const recentApplications = await prisma.job_application.findMany({
        where: { job_id: jobId },
        include: {
          job_seeker: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { applied_at: 'desc' },
        take: BATCH_SIZE
      });

      // Reverse to show oldest first in the email
      recentApplications.reverse();
      const frontendURL = process.env.FRONTEND_URL || 'https://bahathjobz.com';
      const applicationLink = `${frontendURL}/employer/applications?jobId=${jobId}`;
      
      // Build applicants list HTML
      const applicantsListHTML = recentApplications.map((app, index) => `
        <div style="background: #f9fafb; border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
          <h4 style="color: #1f2937; font-size: 16px; margin: 0 0 10px 0;">
            Applicant ${index + 1}: ${app.job_seeker.first_name} ${app.job_seeker.last_name}
          </h4>
          <p style="color: #4b5563; font-size: 14px; margin: 5px 0;">
            <strong>Email:</strong> ${app.job_seeker.email}
          </p>
          ${app.job_seeker.phone ? `
          <p style="color: #4b5563; font-size: 14px; margin: 5px 0;">
            <strong>Phone:</strong> ${app.job_seeker.phone}
          </p>
          ` : ''}
          ${app.cover_note ? `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; background: white; padding: 10px; border-radius: 6px;">
              <strong>Cover Note:</strong> ${app.cover_note}
            </p>
          </div>
          ` : ''}
        </div>
      `).join('');

      // Build applicants list text
      const applicantsListText = recentApplications.map((app, index) => `
Applicant ${index + 1}:
- Name: ${app.job_seeker.first_name} ${app.job_seeker.last_name}
- Email: ${app.job_seeker.email}
${app.job_seeker.phone ? `- Phone: ${app.job_seeker.phone}` : ''}
${app.cover_note ? `- Cover Note: ${app.cover_note}` : ''}
      `).join('\n');

      const emailResult = await sendEmail({
        to: employer.email,
        subject: `${BATCH_SIZE} New Applications for ${job.title} - Bahath Jobz`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">BAHATH JOBZ</h1>
            </div>
            
            <div style="padding: 40px 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">${BATCH_SIZE} New Applications Received! 🎉</h2>
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px;">
                Hello ${employer?.first_name || 'Employer'},
              </p>
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px;">
                Great news! You have received <strong>${BATCH_SIZE} new applications</strong> for one of your job postings.
              </p>
              
              <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #2563eb; font-size: 20px; margin-bottom: 15px; margin-top: 0;">Job Details</h3>
                <p style="color: #4b5563; font-size: 16px; margin: 8px 0;">
                  <strong>Position:</strong> ${job.title}
                </p>
                <p style="color: #4b5563; font-size: 16px; margin: 8px 0;">
                  <strong>Company:</strong> ${company?.name || 'N/A'}
                </p>
                <p style="color: #4b5563; font-size: 16px; margin: 8px 0;">
                  <strong>Location:</strong> ${job.location}
                </p>
                <p style="color: #4b5563; font-size: 16px; margin: 8px 0;">
                  <strong>Total Applications:</strong> ${totalApplications}
                </p>
              </div>

              <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #2563eb; font-size: 20px; margin-bottom: 20px; margin-top: 0;">New Applicants (Last ${BATCH_SIZE})</h3>
                ${applicantsListHTML}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${applicationLink}" 
                   style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                  View All Applications
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                You will receive another email notification when you reach ${totalApplications + BATCH_SIZE} total applications.
              </p>
            </div>

            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated notification from Bahath Jobz. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
${BATCH_SIZE} New Applications Received!

Job Details:
- Position: ${job.title}
- Company: ${company?.name || 'N/A'}
- Location: ${job.location}
- Total Applications: ${totalApplications}

New Applicants (Last ${BATCH_SIZE}):
${applicantsListText}

View all applications: ${applicationLink}

You will receive another email notification when you reach ${totalApplications + BATCH_SIZE} total applications.

Best regards,
Bahath Jobz Team
        `
      });

      if (emailResult.success) {
        console.log(`✅ Batch application notification email sent to employer: ${employer.email} (${BATCH_SIZE} new applications, ${totalApplications} total)`);
      } else {
        console.error(`❌ Failed to send batch application notification email:`, emailResult.error);
      }
    } else if (employer && employer.email) {
      // Log that we're not sending email yet (not at batch threshold)
      console.log(`📊 Application received for job ${jobId}. Total: ${totalApplications}. Email will be sent at ${Math.ceil(totalApplications / BATCH_SIZE) * BATCH_SIZE} applications.`);
    }

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    //console.error('Job application error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});


// Add engagement (like, favorite, interest)
router.post('/:id/engage', authenticateToken, async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { type, content } = req.body;
    const userId = req.user.id;

    if (!['like', 'comment', 'favorite', 'interest'].includes(type)) {
      return res.status(400).json({ message: 'Invalid engagement type' });
    }

    if (['like', 'favorite', 'interest'].includes(type)) {
      const existing = await prisma.engagement.findFirst({
        where: {
          job_id: jobId,
          user_id: userId,
          type
        }
      });

      if (existing) {
        await prisma.engagement.delete({ where: { id: existing.id } });
        return res.json({ message: `${type} removed` });
      }
    }

    await prisma.engagement.create({
      data: {
        job_id: jobId,
        user_id: userId,
        type,
        content
      }
    });

    res.status(201).json({ message: `${type} added successfully` });
  } catch (error) {
    console.error('Engagement error:', error);
    res.status(500).json({ message: 'Failed to add engagement' });
  }
});


// Get all engagements for a job
router.get('/:id/engage', authenticateToken, async (req, res) => {
  try {
    const { id: jobId } = req.params;

    const engagements = await prisma.engagement.findMany({
      where: { job_id: jobId },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            avatar: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Group by type for convenience
    const summary = {
      like: engagements.filter(e => e.type === 'like').length,
      favorite: engagements.filter(e => e.type === 'favorite').length,
      interest: engagements.filter(e => e.type === 'interest').length,
      comments: engagements
        .filter(e => e.type === 'comment')
        .map(c => ({
          id: c.id,
          user: {
            id: c.user.id,
            first_name: c.user.first_name,
            last_name: c.user.last_name,
            email: c.user.email,
            role: c.user.role
          },
          content: c.content,
          created_at: c.created_at
        }))
    };

    res.json({
      message: 'Engagements fetched successfully',
      summary,
      engagements
    });
  } catch (error) {
    console.error('Get Engagements error:', error);
    res.status(500).json({ message: 'Failed to fetch engagements' });
  }
});


export default router;



// router.put('/:id', authenticateToken, requireRole(['employer']), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const employer_id = req.user.id;
//     const jobData = req.body;

//        console.log("=== Edit Job Request ===");
//     console.log("Job ID:", id);
//     console.log("Employer ID:", employer_id);
//     console.log("Received Data:", jobData);

//     // check ownership
//     const existingJob = await prisma.job.findFirst({
//       where: {
//         id,
//         employer_id
//       }
//     });

//     if (!existingJob) {
//       return res.status(404).json({ message: 'Job not found or not owned by you' });
//     }

//     const updatedJob = await prisma.job.update({
//       where: { id },
//       data: {
//         title: jobData.title,
//         description: jobData.description,
//         responsibilities: jobData.responsibilities,
//         requirements: jobData.requirements,
//         benefits: jobData.benefits,
//         location: jobData.location,
//         work_type: jobData.work_type,
//         industry: jobData.industry,
//         education: jobData.education,
//         visa_eligible: jobData.visa_eligible || false,
//         seniority: jobData.seniority,
//         salary_min: jobData.salary_min,
//         salary_max: jobData.salary_max,
//         currency: jobData.currency || 'USD',
//         deadline: jobData.deadline ? new Date(jobData.deadline) : null,
//       }
//     });

//     res.json({
//       message: 'Job updated successfully.',
//       job: updatedJob
//     });
//   } catch (error) {
//     console.error('Job update error:', error);
//     res.status(500).json({ message: 'Failed to update job', error: error.message });
//   }
// });

// router.get('/', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const search = req.query.search || '';
//     const location = req.query.location || '';
//     const industry = req.query.industry || '';
//     const work_type = req.query.work_type || '';
//     const seniority = req.query.seniority || '';

//     const where = {
//       is_active: true,
//       is_approved: true,
//       company: {
//         is_approved: true
//       },
//       ...(search && {
//         OR: [
//           { title: { contains: search, mode: 'insensitive' } },
//           { description: { contains: search, mode: 'insensitive' } },
//           { company: { name: { contains: search, mode: 'insensitive' } } }
//         ]
//       }),
//       ...(location && { location: { contains: location, mode: 'insensitive' } }),
//       ...(industry && { industry }),
//       ...(work_type && { work_type }),
//       ...(seniority && { seniority })
//     };

//     const jobs = await prisma.job.findMany({
//       where,
//       include: {
//         company: {
//           select: {
//             name: true,
//             logo: true
//           }
//         }
//       },
//       orderBy: { created_at: 'desc' },
//       skip: (page - 1) * limit,
//       take: limit
//     });

//     const total = await prisma.job.count({ where });

//     res.json({
//       jobs: jobs.map(job => ({
//         ...job,
//         company_name: job.company.name,
//         company_logo: job.company.logo
//       })),
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Jobs fetch error:', error);
//     res.status(500).json({ message: 'Failed to fetch jobs' });
//   }
// });


// router.delete('/:id', authenticateToken, requireRole(['employer']), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const employer_id = req.user.id;

//     // Verify job belongs to this employer
//     const job = await prisma.job.findFirst({
//       where: {
//         id,
//         employer_id
//       }
//     });

//     if (!job) {
//       return res.status(404).json({ message: 'Job not found or you do not have permission to delete it' });
//     }

//     // Delete job (this will cascade delete applications due to foreign key)
//     await prisma.job.delete({
//       where: { id }
//     });

//     res.json({ message: 'Job deleted successfully' });
//   } catch (error) {
//     console.error('Job deletion error:', error);
//     res.status(500).json({ message: 'Failed to delete job' });
//   }
// });