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
  checkTravellerByMobile,
  checkOwnerByMobile,
  getBookedDates,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getOwnerBookedUsers,
  ownerCancelBooking
} from "../controllers/owner.controller.js";
import { getBookingInvoice, previewPricing } from "../controllers/bookingController.js";
import { createManager } from "../controllers/managerController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/dashboard", requireAuth, getOwnerDashboard);
router.get("/my-properties", requireAuth, getOwnerProperties);
router.get("/bookings", requireAuth, getOwnerBookings);
router.post("/bookings/cancel/:bookingId", requireAuth, ownerCancelBooking);
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
router.get("/invoice/:bookingId", requireAuth, getBookingInvoice);
router.post("/check-owner-mobile", requireAuth, checkOwnerByMobile);
router.get("/property/:id/booked-dates", requireAuth, getBookedDates);
router.post("/offline-booking/create-order", requireAuth, createRazorpayOrder);
router.get("/booked-users", requireAuth, getOwnerBookedUsers);
router.post("/pricing-preview", requireAuth, previewPricing);
router.post("/offline-booking/verify", requireAuth, verifyRazorpayPayment);
router.post("/manager/create", requireAuth, createManager);



export default router;
