import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { KycForm, KycSubmission } from "../models/kyc";
import User from "../models/User";
import { sendNotification } from "../utils/notify";

/* ===================== ADMIN ===================== */

/* ============================================
   ✅ CREATE NEW KYC FORM
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

    const existing = await KycForm.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "KYC Form already exists" });
    }

    const newForm = await KycForm.create({
      name,
      fields,
      status: status || "active",
    });

    console.log("✅ Created new KYC form:", newForm);
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
    const forms = await KycForm.find().sort({ createdAt: -1 });
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
    const { id } = req.params;
    const { name, fields, status } = req.body;

    // Validation
    if (!name || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: "Invalid KYC form data" });
    }

    const form = await KycForm.findById(id);
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

    form.name = name;
    form.fields = fields;
    form.status = status || form.status;
    await form.save();

    console.log(`✅ Updated KYC form: ${form._id}`);
    res.status(200).json({
      message: "KYC form updated successfully",
      form,
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
    const { id } = req.params;
    const deleted = await KycForm.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "KYC form not found" });
    }

    console.log(`🗑️ Deleted KYC form: ${deleted._id}`);
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
    const activeForms = await KycForm.find({ status: "active" }).sort({
      createdAt: -1,
    });
    res.json(activeForms);
  }
);

// ✅ Submit user KYC
// ✅ Submit user KYC (allow resubmit if rejected)
export const submitUserKyc = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    const { formId, fields } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existing = await KycSubmission.findOne({
      user: userId,
      form: formId,
    });

    // 🔒 If there's an existing submission
    if (existing) {
      if (existing.status === "pending") {
        res
          .status(400)
          .json({ message: "KYC already submitted and pending review" });
        return;
      }
      if (existing.status === "approved") {
        res
          .status(400)
          .json({ message: "KYC already approved — cannot resubmit" });
        return;
      }

      // 🟢 If rejected, allow resubmission: update fields + reset status
      existing.fields = fields;
      existing.status = "pending";
      existing.reason = ""; // clear rejection reason
      await existing.save();

      await User.findByIdAndUpdate(userId, { kycStatus: "pending" });

      res.status(200).json({
        message: "KYC re-submitted successfully",
        submission: existing,
      });
      return;
    }

    // 🆕 First-time submission
    const submission = await KycSubmission.create({
      user: userId,
      form: formId,
      fields,
      status: "pending",
    });

    await User.findByIdAndUpdate(userId, { kycStatus: "pending" });

    res.status(201).json({ message: "KYC submitted successfully", submission });
  }
);

// ✅ Get user’s submitted KYC
export const getUserKyc = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const kyc = await KycSubmission.find({ user: userId }).populate("form");
    res.json(kyc);
  }
);

/* ===================== ADMIN REVIEW ===================== */

// ✅ Get all KYC submissions (filter by status)
export const getAllKycSubmissions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query;
    const query = status ? { status } : {};
    const submissions = await KycSubmission.find(query)
      .populate("user", "name email")
      .populate("form", "name")
      .sort({ createdAt: -1 });

    res.json(submissions);
  }
);

// ✅ Approve or Reject KYC
export const updateKycStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, reason } = req.body; // "approved" | "rejected"

    const kyc = await KycSubmission.findById(id);
    if (!kyc) {
      res.status(404).json({ message: "KYC submission not found" });
      return;
    }

    kyc.status = status;
    if (reason) {
      kyc.reason = reason; // ✅ store rejection reason
    }
    await kyc.save();

    // update user profile KYC status
    await User.findByIdAndUpdate(kyc.user, { kycStatus: status });

    await sendNotification(
      kyc.user.toString(),
      `KYC ${status === "approved" ? "Approved" : "Rejected"}`,
      status === "approved"
        ? "Your KYC has been successfully approved."
        : `Your KYC was rejected. ${reason ? `Reason: ${reason}` : ""}`,
      "kyc"
    );

    res.json({ message: `KYC ${status}` });
  }
);
