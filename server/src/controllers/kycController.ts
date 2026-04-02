// src/controllers/kycController.ts

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";
import { sendNotification } from "../utils/notify";

/* ===================== ADMIN ===================== */

/* ============================================
   CREATE NEW KYC FORM
============================================ */
export const createKycForm = async (req: Request, res: Response) => {
  try {
    console.log("🟢 Incoming KYC form body:", req.body);

    const { name, fields, status } = req.body;

    // Validation
    if (!name || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: "Invalid KYC form data" });
    }

    // Validate field structure
    for (const field of fields) {
      if (
        typeof field.label !== "string" ||
        !["text", "file"].includes(field.type) ||
        typeof field.required !== "boolean"
      ) {
        return res.status(400).json({
          message: `Invalid field structure: ${JSON.stringify(field)}`,
        });
      }
    }

    const existing = await prisma.kycForm.findFirst({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: "KYC Form already exists" });
    }
    const newForm = await prisma.kycForm.create({
      data: {
        name,
        fields,
        status: status || "active",
      },
    });
    res.status(201).json({
      message: "KYC form created successfully",
      form: newForm,
    });
  } catch (err: any) {
    console.error("❌ Error creating KYC form:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* ============================================
   ✅ GET ALL KYC FORMS
============================================ */
export const getAllKycForms = async (req: Request, res: Response) => {
  try {
    const forms = await prisma.kycForm.findMany({ orderBy: { createdAt: "desc" } });
    res.status(200).json({ forms });
  } catch (err: any) {
    console.error("❌ Error fetching KYC forms:", err);
    res.status(500).json({ message: "Failed to fetch KYC forms" });
  }
};

/* ============================================
   ✅ UPDATE EXISTING KYC FORM
============================================ */
export const updateKycForm = async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    id = Array.isArray(id) ? id[0] : id;
    const { name, fields, status } = req.body;

    // Validation
    if (!name || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: "Invalid KYC form data" });
    }

    const form = await prisma.kycForm.findUnique({ where: { id } });
    if (!form) {
      return res.status(404).json({ message: "KYC Form not found" });
    }

    // Validate fields again (for safety)
    for (const field of fields) {
      if (
        typeof field.label !== "string" ||
        !["text", "file"].includes(field.type) ||
        typeof field.required !== "boolean"
      ) {
        return res.status(400).json({
          message: `Invalid field structure: ${JSON.stringify(field)}`,
        });
      }
    }

    const updatedForm = await prisma.kycForm.update({
      where: { id },
      data: { name, fields, status: status || form.status },
    });
    res.status(200).json({
      message: "KYC form updated successfully",
      form: updatedForm,
    });
  } catch (err: any) {
    console.error("❌ Error updating KYC form:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* ============================================
   ✅ DELETE KYC FORM
============================================ */
export const deleteKycForm = async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    id = Array.isArray(id) ? id[0] : id;
    const deleted = await prisma.kycForm.delete({ where: { id } });
    res.status(200).json({ message: "KYC form deleted successfully" });
  } catch (err: any) {
    console.error("❌ Error deleting KYC form:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================== USER ===================== */

// ✅ Get active KYC forms (for user selection)
export const getActiveKycForms = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const activeForms = await prisma.kycForm.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
    res.json(activeForms);
  }
);

// ✅ Submit user KYC
// ✅ Submit user KYC (allow resubmit if rejected)
export const submitUserKyc = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    console.log("========= KYC SUBMISSION START =========");

    try {
      /* ================= USER ================= */
      const userId = req.user?.id;
      console.log("User ID:", userId);

      if (!userId) {
        console.log("❌ No userId found");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      /* ================= BODY ================= */
      console.log("Raw req.body:", req.body);

      let { formId, fields } = req.body;

      console.log("Form ID:", formId);
      console.log("Fields (before parse):", fields);

      /* ================= PARSE FIELDS ================= */

      if (!fields) {
        console.log("⚠️ fields is undefined, setting empty object");
        fields = {};
      }

      if (typeof fields === "string") {
        try {
          fields = JSON.parse(fields);
          console.log("Fields parsed successfully:", fields);
        } catch (err) {
          console.error("❌ JSON.parse(fields) failed:", err);
          res.status(400).json({ message: "Invalid fields JSON" });
          return;
        }
      }

      /* ================= FILES ================= */

      console.log("Raw req.files:", req.files);

      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file: any) => {
          console.log("Uploaded File:", {
            fieldname: file.fieldname,
            location: file.location,
            originalname: file.originalname,
          });

          if (file.location) {
            fields[file.fieldname] = file.location;
          }
        });
      }

      console.log("Fields after file injection:", fields);

      /* ================= EXISTING SUBMISSION ================= */

      console.log("Checking existing submission...");

      const existing = await prisma.kycSubmission.findFirst({
        where: { userId, formId },
      });

      console.log("Existing submission:", existing);

      /* ================= RESUBMISSION ================= */

      if (existing) {
        if (existing.status === "pending") {
          console.log("❌ Submission already pending");

          res.status(400).json({
            message: "KYC already submitted and pending review",
          });
          return;
        }

        if (existing.status === "approved") {
          console.log("❌ Submission already approved");

          res.status(400).json({
            message: "KYC already approved — cannot resubmit",
          });
          return;
        }

        console.log("Updating rejected submission...");

        const updated = await prisma.kycSubmission.update({
          where: { id: existing.id },
          data: {
            fields,
            status: "pending",
            reason: "",
          },
        });

        console.log("Submission updated:", updated);

        await prisma.user.update({
          where: { id: userId },
          data: { kycStatus: "pending" },
        });

        console.log("User KYC status updated");

        res.status(200).json({
          message: "KYC re-submitted successfully",
          submission: updated,
        });

        console.log("========= KYC RESUBMISSION COMPLETE =========");

        return;
      }

      /* ================= CREATE NEW ================= */

      console.log("Creating new KYC submission...");

      const submission = await prisma.kycSubmission.create({
        data: {
          userId,
          formId,
          fields,
          status: "pending",
        },
      });

      console.log("New submission created:", submission);

      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: "pending" },
      });

      console.log("User KYC status updated to pending");

      res.status(201).json({
        message: "KYC submitted successfully",
        submission,
      });

      console.log("========= KYC SUBMISSION COMPLETE =========");
    } catch (error) {
      console.error("🔥 KYC SUBMISSION ERROR:", error);

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

// ✅ Get user’s submitted KYC
export const getUserKyc = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const kyc = await prisma.kycSubmission.findMany({
      where: { userId },
      include: { form: true },
    });
    res.json(kyc);
  }
);

/* ===================== ADMIN REVIEW ===================== */

// ✅ Get all KYC submissions (filter by status)
export const getAllKycSubmissions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query;
    const submissions = await prisma.kycSubmission.findMany({
      where: status ? { status: status as string } : {},
      include: {
        user: { select: { name: true, email: true } },
        form: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(submissions);
  }
);

// ✅ Approve or Reject KYC
export const updateKycStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let id = req.params.id;
    id = Array.isArray(id) ? id[0] : id;
    const { status, reason } = req.body; // "approved" | "rejected"

    const kyc = await prisma.kycSubmission.findUnique({ where: { id } });
    if (!kyc) {
      res.status(404).json({ message: "KYC submission not found" });
      return;
    }
    const updated = await prisma.kycSubmission.update({
      where: { id },
      data: { status, reason: reason || undefined },
    });
    await prisma.user.update({ where: { id: kyc.userId }, data: { kycStatus: status } });
    await sendNotification(
      kyc.userId,
      `KYC ${status === "approved" ? "Approved" : "Rejected"}`,
      status === "approved"
        ? "Your KYC has been successfully approved."
        : `Your KYC was rejected. ${reason ? `Reason: ${reason}` : ""}`,
      "kyc"
    );
    res.json({ message: `KYC ${status}` });
  }
);
