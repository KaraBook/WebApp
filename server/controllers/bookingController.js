import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { propertyId, totalAmount, checkIn, checkOut, guests, contactNumber } = req.body;
    const userId = req.user.id;

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const booking = await Booking.create({
      userId,
      propertyId,
      checkIn,
      checkOut,
      guests,
      totalNights: Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
      ),
      totalAmount,
      orderId: order.id,
      contactNumber,
    });

    res.json({ success: true, order, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const booking = await Booking.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { paymentStatus: "paid", paymentId: razorpay_payment_id },
        { new: true }
      );
      return res.json({ success: true, message: "Payment verified", booking });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};


export const getBookedDates = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const bookings = await Booking.find({
      propertyId,
      paymentStatus: "paid",
    }).select("checkIn checkOut");

    const dates = bookings.map((b) => ({
      start: b.checkIn,
      end: b.checkOut,
    }));

    res.json({ success: true, dates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch booked dates" });
  }
};
