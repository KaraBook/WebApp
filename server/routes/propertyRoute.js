import express from "express";
import {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  blockProperty,
  unblockProperty,
} from "../controllers/propertyController.js";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth.js";
import upload from "../middlewares/multer.js";
import {
  validateCreateProperty,
  validateUpdateProperty,
} from "../middlewares/propertyValidator.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "shopAct", maxCount: 1 },
    { name: "galleryPhotos", maxCount: 15 },
  ]),
  validateCreateProperty,
  createProperty
);

router.get("/", getAllProperties);
router.get("/:id", getSingleProperty);

router.put(
  "/:id",
  requireAuth, requireAdmin,
  upload.fields([{ name: "coverImage" }, { name: "galleryPhotos" }, { name: "shopAct" }]),
  validateUpdateProperty,
  updateProperty
);

router.put("/:id/block", requireAuth, requireAdmin, blockProperty);
router.put("/:id/unblock", requireAuth, requireAdmin, unblockProperty);

export default router;
