// Utility function to send job notification emails to interested job seekers
import { PrismaClient } from '@prisma/client';
import sendEmail from './sendmail.js';

const prisma = new PrismaClient();

export async function sendJobNotificationEmails(job, company) {
  try {
    // Get notification interests from job
    const notificationInterests = job.notification_interests;
    
    if (!notificationInterests || !Array.isArray(notificationInterests) || notificationInterests.length === 0) {
      return;
    }

    // Find all job seekers who have matching interests
    // Since Prisma doesn't support array_contains for JSON, we'll fetch all active job seekers with interests
    // and filter in JavaScript
    const allJobSeekers = await prisma.user.findMany({
      where: {
        role: 'job_seeker',
        is_active: true,
        interests_selected: true,
        interests: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        interests: true,
      },
    });

    // Filter job seekers whose interests intersect with notification interests
    const jobSeekers = allJobSeekers.filter((jobSeeker) => {
      const userInterests = Array.isArray(jobSeeker.interests) ? jobSeeker.interests : [];
      return userInterests.some(interest => notificationInterests.includes(interest));
    });

    if (jobSeekers.length === 0) {
      return;
    }

    // Send emails to all matching job seekers
    const emailPromises = jobSeekers.map(async (jobSeeker) => {
      // Check if user's interests actually intersect with notification interests
      const userInterests = Array.isArray(jobSeeker.interests) ? jobSeeker.interests : [];
      const matchingInterests = userInterests.filter(interest => 
        notificationInterests.includes(interest)
      );

      if (matchingInterests.length === 0) {
        return; // Skip if no actual match
      }

      const frontendUrl = process.env.FRONTEND_URL || 'https://bahathjobz.com';
      const jobUrl = `${frontendUrl}/jobs/${job.id}`;
      const unsubscribeUrl = `${frontendUrl}/profile`;

      const emailSubject = `New Job Opportunity: ${job.title} at ${company.name}`;
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Job Opportunity</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #234c6a 0%, #1b3c53 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Job Opportunity!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello ${jobSeeker.first_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We found a new job posting that matches your interests: <strong>${matchingInterests.join(', ')}</strong>
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #234c6a;">
              <h2 style="color: #234c6a; margin-top: 0; font-size: 20px;">${job.title}</h2>
              <p style="margin: 10px 0;"><strong>Company:</strong> ${company.name}</p>
              <p style="margin: 10px 0;"><strong>Location:</strong> ${job.location}</p>
              <p style="margin: 10px 0;"><strong>Work Type:</strong> ${job.work_type.charAt(0).toUpperCase() + job.work_type.slice(1)}</p>
              ${job.salary_min && job.salary_max ? `<p style="margin: 10px 0;"><strong>Salary:</strong> ${job.salary_min} - ${job.salary_max} ${job.currency}</p>` : ''}
              <p style="margin: 10px 0;"><strong>Industry:</strong> ${job.industry}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${jobUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #234c6a 0%, #1b3c53 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                View Job Details
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              You're receiving this email because you selected interests matching this job posting. 
              <a href="${unsubscribeUrl}" style="color: #234c6a;">Update your interests</a> to change which jobs you're notified about.
            </p>
            
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; text-align: center;">
              © ${new Date().getFullYear()} Bahath Jobz. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `;

      const emailText = `
New Job Opportunity: ${job.title} at ${company.name}

Hello ${jobSeeker.first_name},

We found a new job posting that matches your interests: ${matchingInterests.join(', ')}

Job Title: ${job.title}
Company: ${company.name}
Location: ${job.location}
Work Type: ${job.work_type.charAt(0).toUpperCase() + job.work_type.slice(1)}
${job.salary_min && job.salary_max ? `Salary: ${job.salary_min} - ${job.salary_max} ${job.currency}` : ''}
Industry: ${job.industry}

View the full job details: ${jobUrl}

You're receiving this email because you selected interests matching this job posting. 
Update your interests at ${unsubscribeUrl} to change which jobs you're notified about.

© ${new Date().getFullYear()} Bahath Jobz. All rights reserved.
      `;

      try {
        const result = await sendEmail({
          to: jobSeeker.email,
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
        });

        if (!result.success) {
          console.error(`Failed to send email to ${jobSeeker.email}:`, result.error);
        }
      } catch (error) {
        console.error(`Error sending email to ${jobSeeker.email}:`, error.message);
      }
    });

    // Wait for all emails to be sent (but don't fail if some fail)
    await Promise.allSettled(emailPromises);
  } catch (error) {
    console.error('Error in sendJobNotificationEmails:', error);
    throw error;
  }
}

