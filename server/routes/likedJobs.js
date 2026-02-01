// server/routes/likedJobs.js
import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();


// Get all liked jobs for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
//   console.log("GET /api/liked-jobs user:", req.user.id);

  try {
    const likedJobs = await prisma.liked_job.findMany({
      where: { user_id: req.user.id },
      include: {
        job: {
          include: { company: true }, // fetch job + company details
        },
      },
      orderBy: { liked_at: "desc" },
    });

    // console.log("Fetched liked jobs:", likedJobs.length);

    res.json({
      likedJobs: likedJobs.map((lj) => ({
        id: lj.id,
        liked_at: lj.liked_at,
        job: lj.job, // includes title, company, etc.
      })),
    });
  } catch (error) {
    // console.error("Error fetching liked jobs:", error);
    res.status(500).json({ message: "Failed to fetch liked jobs" });
  }
});

// Like a job
router.post("/", authenticateToken, async (req, res) => {
//   console.log("POST /api/liked-jobs body:", req.body);

  try {
    const { jobId } = req.body;

    // Check if job exists in job table
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Prevent duplicate like
    const existing = await prisma.liked_job.findFirst({
      where: { user_id: req.user.id, job_id: jobId },
    });

    if (existing) {
      console.log("Already liked:", jobId);
      return res.status(400).json({ message: "Job already liked" });
    }

    const likedJob = await prisma.liked_job.create({
      data: {
        user_id: req.user.id,
        job_id: jobId,
      },
      include: { job: true },
    });

    // console.log("Job liked:", likedJob);

    res.status(201).json({
      message: "Job liked successfully",
      job: likedJob.job,
    });
  } catch (error) {
    // console.error("Error liking job:", error);
    res.status(500).json({ message: "Failed to like job" });
  }
});

// Delete a liked job
router.delete("/:jobId", authenticateToken, async (req, res) => {
//   console.log("DELETE /api/liked-jobs jobId:", req.params.jobId);

  try {
    const { jobId } = req.params;

    const job = await prisma.liked_job.findFirst({
      where: { user_id: req.user.id, job_id: jobId },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found in liked list" });
    }

    await prisma.liked_job.delete({
      where: { id: job.id },
    });

    // console.log("Job unliked:", jobId);

    res.json({ message: "Job unliked successfully", jobId });
  } catch (error) {
    // console.error("Error unliking job:", error);
    res.status(500).json({ message: "Failed to unlike job" });
  }
});

export default router;
