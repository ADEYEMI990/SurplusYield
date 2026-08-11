// server/src/routes/uploadRoutes.ts

import express from "express";
import multer from "multer";
import { upload } from "../middleware/cloudinaryUpload";

const router = express.Router();

// ✅ Upload route using Cloudinary
router.post("/", (req, res, next) => {
  // Using the general upload from cloudinaryUpload
  const uploadSingle = upload.single("file");
  
  uploadSingle(req, res, (err: any) => {
    if (err) {
      console.error("❌ Cloudinary upload error:", err);
      return res.status(500).json({
        message: "Upload failed",
        error: err.message || err,
      });
    }

    if (!req.file) {
      console.error("❌ No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("✅ Uploaded to Cloudinary:", req.file);
    // Cloudinary URL is in req.file.path
    res.json({ imageUrl: (req.file as any).path });
  });
});

// Route for multiple file uploads
router.post("/multiple", (req, res, next) => {
  const uploadMultiple = upload.array("files", 5);
  
  uploadMultiple(req, res, (err: any) => {
    if (err) {
      console.error("❌ Cloudinary upload error:", err);
      return res.status(500).json({
        message: "Upload failed",
        error: err.message || err,
      });
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      console.error("❌ No files received");
      return res.status(400).json({ message: "No files uploaded" });
    }

    const files = req.files as Express.Multer.File[];
    const fileUrls = files.map((file: any) => file.path);
    
    console.log("✅ Uploaded files to Cloudinary:", fileUrls);
    res.json({ imageUrls: fileUrls });
  });
});

export default router;