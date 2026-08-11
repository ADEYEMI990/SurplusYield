// server/src/middleware/cloudinaryUpload.ts

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary";

// Use dynamic import for uuid
const getUuid = async () => {
  const { v4: uuidv4 } = await import('uuid');
  return uuidv4;
};

// Configure Cloudinary storage for plan icons
const planIconStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const { v4: uuidv4 } = await import('uuid'); // Dynamic import here
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${uuidv4()}`;
    
    return {
      folder: "surplusyield/plans",
      public_id: fileName,
      format: fileExtension,
      resource_type: "auto",
      transformation: [
        { width: 200, height: 200, crop: "limit" },
        { quality: "auto" }
      ]
    };
  },
});

// General upload storage
const generalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const { v4: uuidv4 } = await import('uuid'); // Dynamic import here
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${uuidv4()}`;
    
    let folder = "surplusyield/uploads";
    if (file.mimetype.startsWith("image/")) {
      folder = "surplusyield/images";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "surplusyield/videos";
    } else if (file.mimetype === "application/pdf") {
      folder = "surplusyield/documents";
    }
    
    return {
      folder: folder,
      public_id: fileName,
      format: fileExtension,
      resource_type: "auto",
    };
  },
});

// File filter to accept only certain file types
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "video/mp4",
    "video/mpeg",
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`File type ${file.mimetype} is not allowed.`),
      false
    );
  }
};

// Create multer upload instance for plan icons
export const upload = multer({
  storage: planIconStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for plan icons
  },
});

// General upload for other purposes
export const uploadGeneral = multer({
  storage: generalStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// For multiple files
export const uploadMultiple = uploadGeneral.array("files", 5);

// Helper function to delete files from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

// Helper function to get optimized URL
export const getOptimizedUrl = (publicId: string, options?: any) => {
  return cloudinary.url(publicId, {
    secure: true,
    quality: "auto",
    fetch_format: "auto",
    ...options,
  });
};

// Helper to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const fileName = parts[parts.length - 1];
  return fileName.split(".")[0];
};