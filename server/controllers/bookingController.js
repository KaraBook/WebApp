import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import { sendMail } from "../utils/mailer.js";
import { bookingConfirmationTemplate } from "../utils/emailTemplates.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import { sendWhatsAppText } from "../utils/whatsapp.js";

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
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const booking = await Booking.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentStatus: "paid", paymentId: razorpay_payment_id },
      { new: true }
    )
      .populate("userId", "firstName lastName email mobile")
      .populate("propertyId", "propertyName city state address");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    console.log("✅ Payment verified for:", booking._id);

    if (booking.userId?.email) {
      const mailData = bookingConfirmationTemplate({
        travellerName: `${booking.userId.firstName} ${booking.userId.lastName}`,
        propertyName: booking.propertyId.propertyName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.totalNights,
        guests: booking.guests,
        totalAmount: booking.totalAmount,
        bookingId: booking._id,
        portalUrl: `${process.env.PORTAL_URL}/traveller/bookings/${booking._id}`,
      });

      try {
        await sendMail({
          to: booking.userId.email,
          subject: mailData.subject,
          html: mailData.html,
        });
        console.log("📩 Booking confirmation email sent →", booking.userId.email);
      } catch (emailErr) {
        console.error("❌ Email sending failed:", emailErr);
      }
    }

    try {
      if (booking.userId.mobile) {
        const msg = `🎉 *Booking Confirmed!*

Dear ${booking.userId.firstName},

Your stay at *${booking.propertyId.propertyName}* is confirmed!

📅 *Check-in:* ${new Date(booking.checkIn).toLocaleDateString("en-IN")}
📅 *Check-out:* ${new Date(booking.checkOut).toLocaleDateString("en-IN")}
🧍‍♂️ *Guests:* ${booking.guests}
💰 *Amount Paid:* ₹${booking.totalAmount.toLocaleString("en-IN")}
📍 *Location:* ${booking.propertyId.city}, ${booking.propertyId.state}

🔗 View Booking:
${process.env.PORTAL_URL}/traveller/bookings/${booking._id}

Thank you for choosing us! 🏡`;

        await sendWhatsAppText(booking.userId.mobile, msg);
        console.log("📱 WhatsApp message sent →", booking.userId.mobile);
      }
    } catch (waErr) {
      console.error("❌ WhatsApp sending failed:", waErr);
    }

    return res.json({ success: true, message: "Payment verified", booking });
  } catch (err) {
    console.error("Payment verification ERROR:", err);
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


export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId })
      .populate("propertyId")
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => ({
      ...b._doc,
      property: b.propertyId,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("getUserBookings error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user bookings" });
  }
};


export const getBookingInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const requesterId = req.user?.id; // who is calling — traveller / admin / owner

    const booking = await Booking.findById(bookingId)
      .populate("userId", "firstName lastName email mobile")
      .populate("propertyId", "propertyName address city state ownerUserId resortOwner pricingPerNightWeekdays");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    /* ---------------------------------------------------------------
       🛡️ OWNER ACCESS VALIDATION — IMPORTANT
       If the user is an owner, ensure this booking belongs to their property
    ---------------------------------------------------------------- */
    if (req.user.role === "owner") {
      const property = booking.propertyId;

      const isOwner =
        property.ownerUserId?.toString() === requesterId ||
        property.resortOwner?.mobile === req.user.mobile ||
        property.resortOwner?.email === req.user.email;

      if (!isOwner) {
        return res.status(403).json({ success: false, message: "Access denied — not your booking" });
      }
    }

    // Traveller: must match userId
    if (req.user.role === "traveller") {
      if (booking.userId._id.toString() !== requesterId) {
        return res.status(403).json({ success: false, message: "Not your booking" });
      }
    }

    /* ---------------------------------------------------------------
       Invoice Builder (Same as your existing one)
    ---------------------------------------------------------------- */
    const invoiceData = {
      invoiceNumber: `INV-${booking._id.toString().slice(-6).toUpperCase()}`,
      propertyName: booking.propertyId.propertyName,
      propertyAddress: booking.propertyId.address,
      propertyCity: booking.propertyId.city,
      propertyState: booking.propertyId.state,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.totalNights,
      guests: booking.guests,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      bookingDate: booking.createdAt,
      user: {
        name: `${booking.userId.firstName} ${booking.userId.lastName}`,
        mobile: booking.userId.mobile,
        email: booking.userId.email,
      },
      priceBreakdown: [
        {
          description: "Room Charges",
          rate: `₹${booking.propertyId.pricingPerNightWeekdays.toLocaleString()} × ${booking.totalNights} Nights`,
          total: `₹${booking.totalAmount.toLocaleString()}`,
        },
      ],
    };

    res.json({ success: true, data: invoiceData });
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ success: false, message: "Failed to generate invoice" });
  }
};
