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
} from "../controllers/owner.controller.js";

const router = express.Router();

router.get("/dashboard", requireAuth, getOwnerDashboard);
router.get("/my-properties", requireAuth, getOwnerProperties);
router.get("/bookings", requireAuth, getOwnerBookings);
router.get("/property/:id", requireAuth, getSingleOwnerProperty);
router.put("/property/:id", requireAuth, updateOwnerProperty);

router.get("/property/:id/blocked-dates", requireAuth, getPropertyBlockedDates);
router.post("/property/:id/block-dates", requireAuth, addBlockedDates);
router.delete("/property/:id/block-dates", requireAuth, removeBlockedDates);

export default router;
