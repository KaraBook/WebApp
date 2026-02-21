import express from "express";
import {
  createPropertyDraft,
  attachPropertyMediaAndFinalize,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  blockProperty,
  unblockProperty,
  toggleFeaturedProperty,
  togglePublishProperty,
  getPublishedProperties,
  getPropertyBlockedDatesPublic,
  deleteProperty,
  getDraftProperties,
  getFeaturedProperties
} from "../controllers/propertyController.js";
import { requireAuth, requirePropertyAdmin } from "../middlewares/requireAuth.js";
import upload from "../middlewares/multer.js";
import {
  validatePropertyDraft,
  validatePropertyUpdate,
  ensureMediaFilesPresent, 
} from "../middlewares/propertyValidator.js";

const router = express.Router();

router.post(
  "/draft",
  requireAuth,
  requirePropertyAdmin,
  upload.none(),
  validatePropertyDraft,
  createPropertyDraft
);

router.post(
  "/:id/media",
  requireAuth,
  requirePropertyAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "shopAct", maxCount: 1 },
    { name: "galleryPhotos", maxCount: 20 },
  ]),
  ensureMediaFilesPresent, 
  attachPropertyMediaAndFinalize
);
router.get("/", getAllProperties);
router.get("/published", getPublishedProperties);
router.get("/featured", getFeaturedProperties);
router.get("/drafts", requireAuth, requirePropertyAdmin, getDraftProperties);
router.get("/:id", getSingleProperty);

function conditionalUpload(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    return upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "galleryPhotos", maxCount: 20 },
      { name: "shopAct", maxCount: 1 },
    ])(req, res, next);
  }
  next();
}

router.put(
  "/:id",
  requireAuth,
  requirePropertyAdmin,
  conditionalUpload,
  validatePropertyUpdate,
  updateProperty
);


router.put("/:id/block", requireAuth, requirePropertyAdmin, blockProperty);
router.put("/:id/unblock", requireAuth, requirePropertyAdmin, unblockProperty);
router.put("/:id/toggle-featured", requireAuth, requirePropertyAdmin, toggleFeaturedProperty);
router.put("/:id/toggle-publish", requireAuth, requirePropertyAdmin, togglePublishProperty);
router.get("/:id/blocked-dates", getPropertyBlockedDatesPublic);
router.delete( "/:id", requireAuth, requirePropertyAdmin, deleteProperty);


export default router;
