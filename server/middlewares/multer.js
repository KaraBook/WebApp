import multer from "multer";
import fs from "fs";
import path from "path";


const UPLOAD_BASE = "uploads";

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "misc";

    switch (file.fieldname) {
      case "coverImage":
        folder = "properties/cover";
        break;
      case "shopAct":
        folder = "properties/shopAct";
        break;
      case "galleryPhotos":
        folder = "properties/gallery";
        break;
    }

    const fullPath = path.join(UPLOAD_BASE, folder);
    ensureDir(fullPath);
    cb(null, fullPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(ext, "")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    const uniqueName = `${safeName}_${Date.now()}_${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    cb(null, uniqueName);
  },
});

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "application/pdf", 
];

const fileFilter = (req, file, cb) => {
  if (!ALLOWED.includes(file.mimetype)) {
    return cb(
      new Error(
        "Invalid file type. Allowed: JPG, PNG, WEBP, PDF"
      )
    );
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
