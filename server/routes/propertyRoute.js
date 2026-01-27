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
  getDraftProperties
} from "../controllers/propertyController.js";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth.js";
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
  requireAdmin,
  upload.none(),
  validatePropertyDraft,
  createPropertyDraft
);

router.post(
  "/:id/media",
  requireAuth,
  requireAdmin,
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
router.get("/drafts", requireAuth, requireAdmin, getDraftProperties);
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
  requireAdmin,
  conditionalUpload,
  validatePropertyUpdate,
  updateProperty
);


router.put("/:id/block", requireAuth, requireAdmin, blockProperty);
router.put("/:id/unblock", requireAuth, requireAdmin, unblockProperty);
router.put("/:id/toggle-featured", requireAuth, requireAdmin, toggleFeaturedProperty);
router.put("/:id/toggle-publish", requireAuth, requireAdmin, togglePublishProperty);
router.get("/:id/blocked-dates", getPropertyBlockedDatesPublic);
router.delete( "/:id", requireAuth, requireAdmin, deleteProperty);


export default router;
