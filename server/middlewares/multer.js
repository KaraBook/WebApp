import multer from "multer";
import fs from "fs";
import path from "path";

const UPLOAD_BASE = path.join(process.cwd(), "uploads");

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

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const PDF_TYPE = "application/pdf";

const fileFilter = (req, file, cb) => {

  const isImage = IMAGE_TYPES.includes(file.mimetype);
  const isPDF = file.mimetype === PDF_TYPE;

  if (file.fieldname === "shopAct") {
    if (isImage || isPDF) return cb(null, true);

    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "INVALID_FILE_TYPE"));
  }
  if (!isImage) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "INVALID_IMAGE_TYPE"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,   
    files: 20,

    fieldSize: 20 * 1024 * 1024,   
    fields: 200,                 
    parts: 300                    
  }
});

export default upload;
