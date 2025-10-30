import express from "express";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

const requireAdmin = async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id).select("role");
    if (!u || u.role !== "admin") return res.status(403).json({ message: "Admin only" });
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

router.get("/bookings", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("userId", "firstName lastName email mobile")
      .populate("propertyId", "propertyName city state")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "OK", data: bookings });
  } catch (err) {
    console.error("Admin bookings error:", err);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
});


router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({ role: "traveller" })
      .select("firstName lastName email mobile city state createdAt avatarUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "OK", data: users });
  } catch (err) {
    console.error("Admin users error:", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});


export default router;
