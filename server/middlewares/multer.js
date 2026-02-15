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
  if (file.fieldname === "shopAct") {
    if (
      IMAGE_TYPES.includes(file.mimetype) ||
      file.mimetype === PDF_TYPE
    ) {
      return cb(null, true);
    }
    return cb(
      new Error("Shop Act must be an image (JPG, PNG, WEBP) or PDF")
    );
  }

  if (!IMAGE_TYPES.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG, PNG or WEBP images are allowed")
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
