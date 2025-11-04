import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getOwnerDashboard,
  getOwnerProperties,
  getOwnerBookings,
} from "../controllers/owner.controller.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, getOwnerDashboard);

router.get("/my-properties", authMiddleware, getOwnerProperties);

router.get("/bookings", authMiddleware, getOwnerBookings);

export default router;
