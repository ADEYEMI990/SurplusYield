import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3";
import { v4 as uuidv4 } from "uuid";

const bucketName = process.env.AWS_S3_BUCKET!;

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `plans/${uuidv4()}.${fileExtension}`;
      cb(null, fileName);
    },
  }),
});