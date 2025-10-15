import express from "express";
import { uploadMiddleware, handleUpload } from "../controllers/uploadController";
import { protect } from "../middleware/authMiddleware"; // if you have authentication

const router = express.Router();

router.post("/", protect, uploadMiddleware, handleUpload);

export default router;
