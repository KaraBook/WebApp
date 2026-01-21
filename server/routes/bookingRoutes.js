import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { createOrder, verifyPayment, getBookedDates, getUserBookings, getBookingInvoice  } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create-order", requireAuth, createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/booked-dates/:propertyId", getBookedDates);
router.get("/user", requireAuth, getUserBookings);
router.get("/invoice/:bookingId", requireAuth, getBookingInvoice);
router.get("/:bookingId", requireAuth, getBookingById);

export default router;
