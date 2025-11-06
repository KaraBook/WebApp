import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { getOwnerDashboard, getOwnerProperties, getOwnerBookings, getSingleOwnerProperty,
} from "../controllers/owner.controller.js";

const router = express.Router();

router.get("/dashboard", requireAuth, getOwnerDashboard);

router.get("/my-properties", requireAuth, getOwnerProperties);

router.get("/bookings", requireAuth, getOwnerBookings);

router.get("/property/:id", requireAuth, getSingleOwnerProperty);

export default router;
