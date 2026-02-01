import express from "express";
import { authenticateToken, requireRole, authToken } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

/**Admin: fetch all contact inquiries*/
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    // console.log("GET /api/contacts hit by user:", req.user);
    try {
      const contacts = await prisma.contact_inquiry.findMany({
        orderBy: { created_at: "desc" },
      });
    //   console.log("Contacts fetched:", contacts.length);
      res.json({ contacts });
    } catch (error) {
    //   console.error("Fetch contacts error:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  }
);

/*Admin: fetch single inquiry by ID */
router.get(
  "/:id",
  authenticateToken,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    // console.log("GET /api/contacts/:id hit, params:", req.params);
    try {
      const { id } = req.params;
      const contact = await prisma.contact_inquiry.findUnique({ where: { id } });

      if (!contact) {
        // console.warn("Inquiry not found for id:", id);
        return res.status(404).json({ message: "Inquiry not found" });
      }

    //   console.log("Inquiry fetched:", contact);
      res.json({ contact });
    } catch (error) {
    //   console.error("Fetch contact error:", error);
      res.status(500).json({ message: "Failed to fetch inquiry" });
    }
  }
);

/**Public: create a new inquiry (no auth required) */
router.post("/", async (req, res) => {
//   console.log("POST /api/contacts hit, body:", req.body);
  try {
    const { name, email, inquiry_type, subject, message, priority } = req.body;

    if (!name || !email || !subject || !message) {
    //   console.warn("Missing required fields:", req.body);
      return res.status(400).json({ message: "Missing required fields" });
    }

    const contact = await prisma.contact_inquiry.create({
      data: {
        name,
        email,
        inquiry_type,
        subject,
        message,
        priority: priority || "low",
        status: "pending",
      },
    });

    // console.log("Inquiry created:", contact);
    res.status(201).json({
      message: "Inquiry submitted successfully",
      contact,
    });
  } catch (error) {
    // console.error("Create contact error:", error);
    res.status(500).json({ message: "Failed to submit inquiry" });
  }
});


/**
 * Update Contact Inquiry Status */
router.patch(
  "/:id/status",
  authenticateToken,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    // console.log("👉 PATCH /api/contacts/:id/status called");

    // // Log everything useful
    // console.log("   Params:", req.params);
    // console.log("   Query:", req.query);
    // console.log("   Headers:", req.headers);
    // console.log("   Body:", req.body);

    try {
      const { id } = req.params;
      const { status } = req.body || {}; // avoid destructuring undefined

      if (!status) {
        // console.warn("⚠️ Status missing in request body");
        return res.status(400).json({ message: "Status is required" });
      }

      const validStatuses = ["pending", "in_progress", "responded", "closed"];
      if (!validStatuses.includes(status)) {
        // console.warn("⚠️ Invalid status:", status);
        return res.status(400).json({ message: "Invalid status value" });
      }

      // Update record in database
      const inquiry = await prisma.contact_inquiry.update({
        where: { id },
        data: {
          status,
          responded_at: status === "responded" ? new Date() : null,
        },
      });

    //   console.log("✅ Inquiry updated successfully:", inquiry);

      return res.json({
        message: "Inquiry status updated successfully",
        inquiry,
      });
    } catch (error) {
    //   console.error("❌ Update contact status error:", error);
      return res
        .status(500)
        .json({ message: "Failed to update inquiry status" });
    }
  }
);

/** * Edit Contact Inquiry Fields */
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    // console.log("PUT /api/contacts/:id hit, params:", req.params, "body:", req.body);

    try {
      const { id } = req.params;
      const { name, email, subject, message, priority, status } = req.body;

      const inquiry = await prisma.contact_inquiry.update({
        where: { id },
        data: {
          name,
          email,
          subject,
          message,
          priority,
          status,
        },
      });

      res.json({
        message: "Inquiry updated successfully",
        inquiry,
      });
    } catch (error) {
      console.error("Update contact error:", error);
      res.status(500).json({ message: "Failed to update inquiry" });
    }
  }
);

/**Admin: delete an inquiry */
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    console.log("DELETE /api/contacts/:id hit, params:", req.params);
    try {
      const { id } = req.params;

      const existing = await prisma.contact_inquiry.findUnique({ where: { id } });
      if (!existing) {
        console.warn("Inquiry not found for id:", id);
        return res.status(404).json({ message: "Inquiry not found" });
      }

      await prisma.contact_inquiry.delete({ where: { id } });
      console.log("Inquiry deleted:", id);
      res.json({ message: "Inquiry deleted successfully" });
    } catch (error) {
      console.error("Delete contact error:", error);
      res.status(500).json({ message: "Failed to delete inquiry" });
    }
  }
);

// Reply to a contact inquiry (Admin only)
router.post(
  "/:id/reply",
  authenticateToken,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;

      if (!reply || reply.trim() === "") {
        return res.status(400).json({ message: "Reply message is required" });
      }

      // Ensure inquiry exists
      const inquiry = await prisma.contact_inquiry.findUnique({ where: { id } });
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      // Create reply
      const newReply = await prisma.contact_inquiry_reply.create({
        data: {
          inquiry_id: id,
          admin_id: req.user.id, // from authenticateToken
          reply,
        },
      });

      // Update inquiry status & responded_at timestamp
      await prisma.contact_inquiry.update({
        where: { id },
        data: {
          status: "responded",
          responded_at: new Date(),
        },
      });

      res.status(201).json({
        message: "Reply sent successfully",
        reply: newReply,
      });
    } catch (error) {
      console.error("❌ Reply API error:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  }
);



/* Admin: fetch all replies for an inquiry */
router.get(
  "/:id/replies",
  authenticateToken,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const replies = await prisma.contact_inquiry_reply.findMany({
        where: { inquiry_id: id },
        orderBy: { created_at: "asc" },
      });

      res.json({ replies });
    } catch (error) {
      console.error("❌ Fetch replies error:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  }
);


// Fetch single inquiry + replies
router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const contact = await prisma.contact_inquiry.findUnique({
        where: { id },
        include: {
          replies: {             // ✅ get all replies
            orderBy: { created_at: "asc" },
          },
        },
      });

      if (!contact) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      res.json({ contact });
    } catch (error) {
      console.error("Fetch contact error:", error);
      res.status(500).json({ message: "Failed to fetch inquiry" });
    }
  }
);


router.post(
  "/my-contacts",
  authenticateToken, // first, verify the user is logged in
  requireRole(["job_seeker", "employer", "admin"]), // then, check role
  async (req, res) => {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ message: "User not authenticated properly" });
      }
       console.log("User passed role check:", req.user.role);

      const userEmail = req.user.email;

      const contacts = await prisma.contact_inquiry.findMany({
        where: { email: userEmail },
        include: {
          replies: {
            orderBy: { created_at: "asc" },
          },
        },
        orderBy: { created_at: "desc" },
      });

      res.json({ contacts });
    } catch (error) {
      console.error("❌ Fetch user contacts error:", error);
      res.status(500).json({ message: "Failed to fetch user inquiries" });
    }
  }
);

/* fetch all replies for an inquiry */
/* ✅ Fetch all replies for a contact inquiry (POST) */
router.post(
  "/:id/response",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Fetch replies from DB
      const replies = await prisma.contact_inquiry_reply.findMany({
        where: { inquiry_id: id },
        orderBy: { created_at: "asc" },
      });

      return res.json({
        success: true,
        inquiry_id: id,
        totalReplies: replies.length,
        replies,
      });
    } catch (error) {
      console.error("❌ Fetch replies error:", error);
      return res.status(500).json({ message: "Failed to fetch replies" });
    }
  }
);



export default router;
