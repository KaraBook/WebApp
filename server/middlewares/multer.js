import multer from "multer";
import path from "path";

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];

  if (!allowedExts.includes(ext)) {
    console.error(`❌ Rejected file: ${file.originalname}, Type: ${file.mimetype}`);
    return cb(new Error("Only images are allowed"));
  }

  console.log(`✅ Accepted file: ${file.originalname}, Type: ${file.mimetype}`);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

export default upload;
