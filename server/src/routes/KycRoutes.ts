import express from "express";
import { protect, admin } from "../middleware/authMiddleware";
import { upload } from "../middleware/s3Upload";
import {
  createKycForm,
  getAllKycForms,
  deleteKycForm,
  updateKycForm,
  getActiveKycForms,
  submitUserKyc,
  getUserKyc,
  getAllKycSubmissions,
  updateKycStatus,
} from "../controllers/kycController";

const router = express.Router();

/* =============== ADMIN ROUTES =============== */
router.post("/admin/forms", protect, admin, createKycForm);
router.get("/admin/forms", protect, admin, getAllKycForms);
router.put("/admin/forms/:id", protect, admin, updateKycForm);
router.delete("/admin/forms/:id", protect, admin, deleteKycForm);

router.get("/admin/submissions", protect, admin, getAllKycSubmissions);
router.put("/admin/submissions/:id/status", protect, admin, updateKycStatus);

/* =============== USER ROUTES =============== */
router.get("/forms/active", protect, getActiveKycForms);
router.post("/submit", protect, upload.any(), submitUserKyc);
router.get("/my", protect, getUserKyc);

export default router;
