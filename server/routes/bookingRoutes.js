import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { createOrder, verifyPayment, getBookedDates  } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create-order", requireAuth, createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/booked-dates/:propertyId", getBookedDates);

export default router;
