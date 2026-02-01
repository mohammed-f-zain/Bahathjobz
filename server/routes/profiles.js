// server/routes/profiles.js
import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { PrismaClient } from "@prisma/client";
import { type } from "os";

const VITE_IMAGE_URL = process.env.VITE_IMAGE_URL || "http://localhost:3001";
const router = express.Router();
const prisma = new PrismaClient();

// ------------------------
// Create / Update Job Seeker Profile
// server/routes/profiles.js
router.post(
  "/job-seeker",
  authenticateToken,
  requireRole(["job_seeker"]),
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const profileData = req.body;
      const userId = req.user.id;

      // ------------------------
      // Validate file sizes
      if (req.files.resume && req.files.resume[0].size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "Resume file size cannot exceed 5MB" });
      }
      if (req.files.avatar && req.files.avatar[0].size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Avatar file size cannot exceed 2MB" });
      }

      const resumeUrl = req.files.resume
        ? `/uploads/resumes/${req.files.resume[0].filename}`
        : undefined;
      const avatarUrl = req.files.avatar
        ? `/uploads/avatars/${req.files.avatar[0].filename}`
        : undefined;

      // ------------------------
      // Parse skills
      let skillsArray = [];
      if (Array.isArray(profileData.skills)) {
        skillsArray = profileData.skills;
      } else if (profileData.skills) {
        try {
          skillsArray = JSON.parse(profileData.skills);
        } catch {
          skillsArray = profileData.skills.split(",").map((s) => s.trim());
        }
      }

      // Parse industries
      let industriesArray = [];
      if (profileData.industries) {
        try {
          industriesArray = JSON.parse(profileData.industries);
        } catch {
          industriesArray = profileData.industries.split(",").map((s) => s.trim());
        }
      }

      // Parse compensation safely
      const safeParse = (data) => {
        try {
          return data ? JSON.parse(data) : {};
        } catch {
          return {};
        }
      };

      // ------------------------
      // Parse careerHistory (important!)
      let careerHistoryArray = [];
      if (profileData.careerHistory) {
        if (Array.isArray(profileData.careerHistory)) {
          careerHistoryArray = profileData.careerHistory;
        } else {
          try {
            careerHistoryArray = JSON.parse(profileData.careerHistory);
          } catch {
            careerHistoryArray = [];
          }
        }
      }

      // ------------------------
      // Prepare data
      const userUpdateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        avatar: avatarUrl,
      };

      Object.keys(userUpdateData).forEach(
        (key) => userUpdateData[key] === undefined && delete userUpdateData[key]
      );

      const jobSeekerProfileData = {
        nationality: profileData.nationality,
        dob: profileData.dob ? new Date(profileData.dob) : null,
        age: profileData.age ? parseInt(profileData.age, 10) : null,
        gender: profileData.gender,
        qid_no: profileData.qidNo,
        passport_no: profileData.passportNo,
        visa_status: profileData.visaStatus,
        marital_status: profileData.maritalStatus,
        dependents: profileData.dependents
          ? parseInt(profileData.dependents, 10)
          : null,
        total_experience: profileData.totalExperience
          ? parseInt(profileData.totalExperience, 10)
          : null,
        industries: industriesArray,
        current_position: profileData.currentPosition,
        summary: profileData.summary,
        experience: profileData.experience,
        current_employer_experience: profileData.currentEmployerExperience
          ? parseInt(profileData.currentEmployerExperience, 10)
          : null,
        current_compensation: safeParse(profileData.currentCompensation),
        expected_compensation: safeParse(profileData.expectedCompensation),
        notice_period: profileData.noticePeriod,
        reason_for_change: profileData.reasonForChange,
        availability: profileData.availability,
        education: profileData.education,
        skills: skillsArray,
        resume_url: resumeUrl,
        location: profileData.location,
        portfolio_url: profileData.portfolioUrl,
        linkedin_url: profileData.linkedinUrl,
        personal_email: profileData.personalEmail,
      };

      Object.keys(jobSeekerProfileData).forEach(
        (key) =>
          jobSeekerProfileData[key] === undefined &&
          delete jobSeekerProfileData[key]
      );

      // ------------------------
      // Transaction: update user, upsert profile, add career history
      const [updatedUser, jobSeekerProfile] = await prisma.$transaction(
        async (tx) => {
          const user = await tx.user.update({
            where: { id: userId },
            data: userUpdateData,
          });

          const profile = await tx.job_seeker.upsert({
            where: { user_id: userId },
            update: jobSeekerProfileData,
            create: {
              user_id: userId,
              ...jobSeekerProfileData,
            },
          });

          const jobSeekerId = profile.id;

          // Add career history
const existingHistory = await tx.career_history.findMany({
  where: { job_seeker_id: jobSeekerId },
});

// Map existing by ID
const existingMap = {};
existingHistory.forEach((h) => {
  existingMap[h.id] = h;
});

for (const ch of careerHistoryArray) {
  if (ch.id && existingMap[ch.id]) {
    // Update existing
    await tx.career_history.update({
      where: { id: ch.id },
      data: {
        company: ch.company,
        title: ch.title,
        position: ch.position,
        location: ch.location,
        from_date: new Date(ch.from_date),
        to_date: ch.to_date ? new Date(ch.to_date) : null,
        currently_working: ch.currentlyWorking,
      },
    });
    delete existingMap[ch.id]; // Mark as handled
  } else {
    // Create new
    await tx.career_history.create({
      data: {
        job_seeker_id: jobSeekerId,
        company: ch.company,
        // title: ch.title, title == type
        title: ch.title,   
        position: ch.position,
        location: ch.location || "N/A", 
        from_date: new Date(ch.from_date),
        to_date: ch.to_date ? new Date(ch.to_date) : null,
        currently_working: ch.currentlyWorking,
      },
    });
  }
}

// Delete removed entries
for (const leftoverId of Object.keys(existingMap)) {
  await tx.career_history.delete({ where: { id: leftoverId } });
}

          return [user, profile];
        }
      );

      res.json({
        message: "Profile and career history saved successfully",
        profile: { ...updatedUser, ...jobSeekerProfile },
      });
    } catch (error) {
      console.error("❌ Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);


// ------------------------
// Get Job Seeker Profile
router.get(
  "/job-seeker/me",
  authenticateToken,
  requireRole(["job_seeker"]),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          job_seeker: {
            include: {
              career_history: true,
            },
          },
        },
      });

      if (!userProfile || !userProfile.job_seeker) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const { job_seeker, ...user } = userProfile;

      // Build complete profile response matching POST API structure exactly
      const fullProfile = {
        // User table fields (raw database fields)
        id: user.id,
        email: user.email,
        password: user.password,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        country: user.country,
        role: user.role,
        avatar: user.avatar ? `${VITE_IMAGE_URL}${user.avatar}` : null,
        googleId: user.googleId,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        
        // Job seeker table fields (raw database fields)
        user_id: job_seeker.user_id,
        personal_email: job_seeker.personal_email,
        profile_pic: job_seeker.profile_pic,
        nationality: job_seeker.nationality,
        dob: job_seeker.dob,
        age: job_seeker.age,
        gender: job_seeker.gender,
        qid_no: job_seeker.qid_no,
        passport_no: job_seeker.passport_no,
        visa_status: job_seeker.visa_status,
        marital_status: job_seeker.marital_status,
        dependents: job_seeker.dependents,
        total_experience: job_seeker.total_experience,
        industries: job_seeker.industries || [],
        current_position: job_seeker.current_position,
        summary: job_seeker.summary,
        experience: job_seeker.experience,
        current_employer_experience: job_seeker.current_employer_experience,
        current_compensation: job_seeker.current_compensation || {},
        expected_compensation: job_seeker.expected_compensation || {},
        notice_period: job_seeker.notice_period,
        reason_for_change: job_seeker.reason_for_change,
        availability: job_seeker.availability,
        education: job_seeker.education,
        skills: job_seeker.skills || [],
        resume_url: job_seeker.resume_url,
        location: job_seeker.location,
        portfolio_url: job_seeker.portfolio_url,
        linkedin_url: job_seeker.linkedin_url,
        qid_no: job_seeker.qid_no,
        
        // Transformed camelCase fields (same as POST API)
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        personalEmail: job_seeker.personal_email,
        resumeUrl: job_seeker.resume_url
          ? `${VITE_IMAGE_URL}${job_seeker.resume_url}`
          : null,
        currentCompensation: job_seeker.current_compensation || {},
        expectedCompensation: job_seeker.expected_compensation || {},
        noticePeriod: job_seeker.notice_period,
        reasonForChange: job_seeker.reason_for_change,
        currentPosition: job_seeker.current_position,
        visaStatus: job_seeker.visa_status,
        portfolioUrl: job_seeker.portfolio_url,
        linkedinUrl: job_seeker.linkedin_url,
        maritalStatus: job_seeker.marital_status,
        totalExperience: job_seeker.total_experience,
        currentEmployerExperience: job_seeker.current_employer_experience,
        createdAt: job_seeker.created_at,
        careerHistory: job_seeker.career_history || [],
      };

      res.json({
        message: "Profile saved successfully",
        profile: fullProfile,
      });
    } catch (error) {
      console.error("❌ Profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  }
);

// ------------------------
// Add Career History
router.post(
  "/job-seeker/career-history",
  authenticateToken,
  requireRole(["job_seeker"]),
  async (req, res) => {
    try {
      const { company, title, position, from_date, to_date, currently_working,location  } = req.body;
      const userId = req.user.id;

      const jobSeeker = await prisma.job_seeker.findUnique({
        where: { user_id: userId },
      });

      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      // Check for duplicate career history entry
      const existingCareerHistory = await prisma.career_history.findFirst({
        where: {
          job_seeker_id: jobSeeker.id,
          company,
          title,
        },
      });

      if (existingCareerHistory) {
        return res.status(409).json({
          message:
            "This career history entry already exists for this profile.",
        });
      }

      const newCareerHistory = await prisma.career_history.create({
        data: {
          job_seeker_id: jobSeeker.id,
          company,
          title,
          position,
          location,
          from_date: new Date(from_date),
          to_date: to_date ? new Date(to_date) : null,
          currently_working,
        },
      });

      res.status(201).json({
        message: "Career history added successfully",
        careerHistory: newCareerHistory,
      });
    } catch (error) {
      console.error("❌ Add career history error:", error);
      res.status(500).json({ message: "Failed to add career history" });
    }
  }
);

// ------------------------
// Get Career History
router.get(
  "/job-seeker/career-history",
  authenticateToken,
  requireRole(["job_seeker"]),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const jobSeeker = await prisma.job_seeker.findUnique({
        where: { user_id: userId },
      });

      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      const careerHistory = await prisma.career_history.findMany({
        where: { job_seeker_id: jobSeeker.id },
        orderBy: { from_date: "desc" },
      });

      res.json({ careerHistory });
    } catch (error) {
      console.error("❌ Get career history error:", error);
      res.status(500).json({ message: "Failed to get career history" });
    }
  }
);

// ------------------------
// Update Career History
router.post(
  "/job-seeker/career-history/:id",
  authenticateToken,
  requireRole(["job_seeker"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { company, title, position, from_date, to_date, currently_working,location } = req.body;
      const userId = req.user.id;

      const jobSeeker = await prisma.job_seeker.findUnique({
        where: { user_id: userId },
      });

      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      const updatedCareerHistory = await prisma.career_history.update({
        where: { id },
        data: {
          company,
          title,
          position,
          location,
          from_date: new Date(from_date),
          to_date: to_date ? new Date(to_date) : null,
          currently_working,
        },
      });

      res.json({
        message: "Career history updated successfully",
        careerHistory: updatedCareerHistory,
      });
    } catch (error) {
      console.error("❌ Update career history error:", error);
      res.status(500).json({ message: "Failed to update career history" });
    }
  }
);

// ------------------------
// Delete Career History
router.delete(
  "/job-seeker/career-history/:id",
  authenticateToken,
  requireRole(["job_seeker"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const jobSeeker = await prisma.job_seeker.findUnique({
        where: { user_id: userId },
      });

      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      await prisma.career_history.delete({
        where: { id },
      });

      res.json({ message: "Career history deleted successfully" });
    } catch (error) {
      console.error("❌ Delete career history error:", error);
      res.status(500).json({ message: "Failed to delete career history" });
    }
  }
);

// ------------------------
// Search job seekers
router.get(
  "/job-seekers/search",
  authenticateToken,
  requireRole(["employer"]),
  async (req, res) => {
    try {
      const { location, skills, education, visaStatus, experience, search,currentPosition,industries   } =
        req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {};

      if (location)
        filters.location = { contains: location, mode: "insensitive" };
      if (education)
        filters.education = { contains: education, mode: "insensitive" };
      if (visaStatus) filters.visa_status = visaStatus;
      if (experience)
        filters.experience = { contains: experience, mode: "insensitive" };
      if (skills) {
        const skillsArray = skills.split(",").map((s) => s.trim());
        filters.skills = { hasSome: skillsArray };
      }
      if (currentPosition)
      filters.current_position = { contains: currentPosition, mode: "insensitive" };
      if (industries) {
  const industriesArray = industries.split(",").map((s) => s.trim());
  filters.industries = {
    array_contains: industriesArray,
  };
}
      if (search) {
        filters.OR = [
          { summary: { contains: search, mode: "insensitive" } },
          { experience: { contains: search, mode: "insensitive" } },
          { education: { contains: search, mode: "insensitive" } },
          { user: { first_name: { contains: search, mode: "insensitive" } } },
          { user: { last_name: { contains: search, mode: "insensitive" } } },
          { current_position: { contains: search, mode: "insensitive" } },
          { industries: { array_contains: [search] } },
        ];
      }

      const [profiles, total] = await Promise.all([
        prisma.job_seeker.findMany({
          where: filters,
          include: {
            user: true,
            career_history: true,
          },
          orderBy: { created_at: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.job_seeker.count({ where: filters }),
      ]);

      res.json({
        profiles: profiles.map((profile) => ({
          id: profile.id,
          userId: profile.user.id,
          firstName: profile.user.first_name,
          lastName: profile.user.last_name,
          email: profile.user.email,
          phone: profile.user.phone,
          personalEmail: profile.personal_email,
          avatar: profile.user.avatar
            ? `${VITE_IMAGE_URL}${profile.user.avatar}`
            : null,
          nationality: profile.nationality,
          currentPosition: profile.current_position,
          location: profile.location,
          visaStatus: profile.visa_status,
          skills: profile.skills || [],
          education: profile.education,
          experience: profile.experience,
          summary: profile.summary,
          industries: profile.industries || [],
          resumeUrl: profile.resume_url
            ? `${VITE_IMAGE_URL}${profile.resume_url}`
            : null,
          portfolioUrl: profile.portfolio_url,
          linkedinUrl: profile.linkedin_url,
          createdAt: profile.created_at,
          careerHistory: profile.career_history || [],
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("❌ Job seeker search error:", error);
      res.status(500).json({ message: "Failed to search job seekers" });
    }
  }
);

export default router;