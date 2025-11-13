import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  getOwnerDashboard,
  getOwnerProperties,
  getOwnerBookings,
  getSingleOwnerProperty,
  updateOwnerProperty,
  getPropertyBlockedDates,
  addBlockedDates,
  removeBlockedDates,
  createOfflineBooking,
  checkTravellerByMobile
} from "../controllers/owner.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/dashboard", requireAuth, getOwnerDashboard);
router.get("/my-properties", requireAuth, getOwnerProperties);
router.get("/bookings", requireAuth, getOwnerBookings);
router.get("/property/:id", requireAuth, getSingleOwnerProperty);
router.put(
  "/property/:id",
  requireAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "shopAct", maxCount: 1 },
    { name: "galleryPhotos", maxCount: 10 },
  ]),
  updateOwnerProperty
);
router.get("/property/:id/blocked-dates", requireAuth, getPropertyBlockedDates);
router.post("/property/:id/block-dates", requireAuth, addBlockedDates);
router.delete("/property/:id/block-dates", requireAuth, removeBlockedDates);
router.post("/offline-booking", requireAuth, createOfflineBooking);
router.post("/check-traveller", requireAuth, checkTravellerByMobile);



export default router;
