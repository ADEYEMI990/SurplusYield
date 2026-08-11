// server/src/utils/cloudinaryCleanup.ts

import { cloudinary } from "../config/cloudinary";
import prisma from "../lib/prisma";

export const cleanupUserFiles = async (userId: string) => {
  try {
    // Delete files from user's KYC submissions
    const submissions = await prisma.kycSubmission.findMany({
      where: { userId },
      select: { fields: true }
    });

    for (const submission of submissions) {
      if (submission.fields && typeof submission.fields === 'object') {
        for (const [key, value] of Object.entries(submission.fields)) {
          if (typeof value === 'string' && value.includes('cloudinary.com')) {
            try {
              // Extract public ID from URL
              const urlParts = value.split('/');
              const fileName = urlParts[urlParts.length - 1];
              const publicId = `surplusyield/${fileName.split('.')[0]}`;
              await cloudinary.uploader.destroy(publicId);
              console.log(`Deleted file: ${publicId}`);
            } catch (error) {
              console.error(`Error deleting file ${value}:`, error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up user files:', error);
  }
};