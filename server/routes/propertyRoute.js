// routes/propertyRoute.js
import express from "express";
import {
  createPropertyDraft,
  attachPropertyMediaAndFinalize,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  blockProperty,
  unblockProperty,
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
router.get("/:id", getSingleProperty);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "galleryPhotos", maxCount: 20 },
    { name: "shopAct", maxCount: 1 },
  ]),
  validatePropertyUpdate,
  updateProperty
);

router.put("/:id/block", requireAuth, requireAdmin, blockProperty);
router.put("/:id/unblock", requireAuth, requireAdmin, unblockProperty);

export default router;
