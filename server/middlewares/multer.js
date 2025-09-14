import multer from "multer";

const storage = multer.memoryStorage(); 
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const fileFilter = (req, file, cb) => {
  if (!ALLOWED.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG or WEBP images are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 20,                 
  },
});

export default upload;
