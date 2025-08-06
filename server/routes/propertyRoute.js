import express from "express";
import { createProperty, getAllProperties, getSingleProperty, updateProperty } from "../controllers/propertyController.js";
import upload from "../middlewares/multer.js";
import { validateProperty } from "../middlewares/propertyValidator.js";

const router = express.Router();

router.post(
  "/",
  upload.fields([{ name: "coverImage" }, { name: "galleryPhotos" }]),
  validateProperty,
  createProperty
);

router.get("/", getAllProperties);

router.get("/:id", getSingleProperty);

router.put(
  "/:id",
  upload.fields([{ name: "coverImage" }, { name: "galleryPhotos" }]),
  validateProperty,
  updateProperty
);

export default router;
