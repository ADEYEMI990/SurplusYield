// server/src/routes/uploadRoutes.ts
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Setup Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "surplusyield_uploads",
    resource_type: "image",
    format: undefined, // auto-detect
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

const upload = multer({ storage });

// ✅ Upload route
// ✅ Upload route
router.post("/", (req, res, next) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      console.error("❌ Multer/Cloudinary upload error:", err);
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
    res.json({ imageUrl: (req.file as any).path });
  });
});

export default router;
