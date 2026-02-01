import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();

const router = express.Router();

// Get applications for job seeker
router.get('/my-applications', authenticateToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const jobSeekerId = req.user.id;

    const applications = await prisma.job_application.findMany({
      where: { job_seeker_id: jobSeekerId },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logo: true
              }
            }
          }
        }
      },
      orderBy: { applied_at: 'desc' }
    });

    res.json({
      applications: applications.map(app => ({
        ...app,
        job_title: app.job.title,
        job_location: app.job.location,
        work_type: app.job.workType,
        company_name: app.job.company.name,
        company_logo: app.job.company.logo
      }))
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Get applications for employer
// Get applications for employer
router.get('/employer', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;
    const jobId = req.query.jobId;
    const status = req.query.status; // <-- get status filter
    const search = req.query.search || '';
    const where = {
      job: {
        is: {
          employer_id: employerId,
          ...(jobId && { id: jobId })
        }
      },
      ...(status && { status }), // <-- apply status filter if provided
      ...(search && {
        OR: [
          {
            job: {
              is: {
                title: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          },
          {
            job_seeker: {
              is: {
                first_name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          },
          {
            job_seeker: {
              is: {
                last_name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
      })
    };
    const applications = await prisma.job_application.findMany({
      where,
      include: {
        job: {
          select: { title: true }
        },
        job_seeker: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            job_seeker: {
              select: {
                summary: true,
                experience: true,
                education: true,
                resume_url: true
              }
            }
          }
        }
      },
      orderBy: { applied_at: 'desc' }
    });

    res.json({
      applications: applications.map(app => ({
        id: app.id,
        job_id: app.job_id,
        job_seeker_id: app.job_seeker_id,
        cover_note: app.cover_note,
        status: app.status,
        applied_at: app.applied_at,
        updated_at: app.updated_at,
        job_title: app.job.title,
        first_name: app.job_seeker.first_name,
        last_name: app.job_seeker.last_name,
        email: app.job_seeker.email,
        phone: app.job_seeker.phone,
        summary: app.job_seeker.job_seeker?.summary,
        experience: app.job_seeker.job_seeker?.experience,
        education: app.job_seeker.job_seeker?.education,
        resume_url: app.job_seeker.job_seeker?.resume_url
      }))
    });

  } catch (error) {
    console.error('Employer applications fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});



// Update application status (employer only)
router.patch('/:id/status', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const { id } = req.params;            // application ID
    const { status } = req.body;          // new status
    const employerId = req.user.id;       // logged-in employer

    // Verify the application belongs to this employer's job
    const application = await prisma.job_application.findFirst({
      where: {
        id,
        job: {
          is: {
            employer_id: employerId
          }
        }
      },
      include: {
        job: {
          select: { title: true } // Include job title for notification
        }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found or not authorized' });
    }

    // Update the application status
    await prisma.job_application.update({
      where: { id },
      data: { status }
    });

    // Notification messages
   const statusMessages = {
  under_review: 'Your application is under review',
  shortlisted: 'Congratulations! You have been shortlisted',
  rejected: 'Your application was not selected',
  hired: 'Congratulations! You have been hired'
};

    // Create notification for job seeker
    await prisma.notification.create({
      data: {
        user_id: application.job_seeker_id,
        title: 'Application Status Update',
        message: `${statusMessages[status]} for ${application.job.title}`,
        type: 'application'
      }
    });

    res.json({ message: 'Application status updated successfully' });

  } catch (error) {
    console.error('Application status update error:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

// Get single application by ID for job seeker
router.get('/:id', authenticateToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const { id } = req.params;
    const jobSeekerId = req.user.id;

    // console.log("Fetching application:", id, "for job_seeker:", jobSeekerId);

    const application = await prisma.job_application.findFirst({
      where: {
        id,
        job_seeker_id: jobSeekerId
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logo: true
              }
            }
          }
        }
      }
    });

    // console.log("DB Application Result:", application);

    if (!application) {
      // console.log("Application not found for job_seeker:", jobSeekerId);
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({
      application: {
        ...application,
        job_title: application.job.title,
        job_location: application.job.location,
        company_name: application.job.company.name,
        company_logo: application.job.company.logo
      }
    });
  } catch (error) {
    // console.error('Single application fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch application' });
  }
});


export default router;
