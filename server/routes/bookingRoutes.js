import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { createOrder, verifyPayment, getBookedDates, getUserBookings, getBookingInvoice, getBookingById, previewPricing, previewCancellation, cancelBooking  } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create-order", requireAuth, createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/booked-dates/:propertyId", getBookedDates);
router.get("/user", requireAuth, getUserBookings);
router.get("/invoice/:bookingId", requireAuth, getBookingInvoice);
router.get("/:bookingId", getBookingById);
router.post("/preview-pricing", requireAuth, previewPricing);
router.get("/cancel-preview/:bookingId", requireAuth, previewCancellation);
router.post("/cancel/:bookingId", requireAuth, cancelBooking);

export default router;
