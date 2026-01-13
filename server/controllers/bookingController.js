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
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay env missing");
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error",
      });
    }

    const { propertyId, checkIn, checkOut, guests, contactNumber, meals } = req.body;
    const userId = req.user.id;

    const property = await Property.findById(propertyId).lean();
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const totalNights = Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24)
    );

    if (!totalNights || totalNights <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range",
      });
    }

    const adults = Number(guests?.adults || 0);
    const children = Number(guests?.children || 0);
    const infants = Number(guests?.infants || 0);

    const totalGuests = adults + children;

    if (totalGuests > Number(property.maxGuests)) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${property.maxGuests} guests allowed`,
      });
    }

    if (meals?.includeMeals) {
      const totalMeals =
        Number(meals.veg || 0) +
        Number(meals.nonVeg || 0) +
        Number(meals.combo || 0);

      if (totalMeals !== totalGuests) {
        return res.status(400).json({
          success: false,
          message: "Meal count must match total guests",
        });
      }
    }

    const baseGuests = Number(property.baseGuests || 0);
    const basePricePerNight = Number(property.pricingPerNightWeekdays || 0);
    const extraAdultCharge = Number(property.extraAdultCharge || 0);
    const extraChildCharge = Number(property.extraChildCharge || 0);

    if (basePricePerNight <= 0) {
      return res.status(400).json({
        success: false,
        message: "Property pricing not configured",
      });
    }

    const baseUsedByAdults = Math.min(adults, baseGuests);
    const remainingBaseSlots = Math.max(0, baseGuests - baseUsedByAdults);

    const extraAdults = Math.max(0, adults - baseGuests);
    const extraChildren = Math.max(0, children - remainingBaseSlots);

    const extraAdultCost = extraAdults * extraAdultCharge;
    const extraChildCost = extraChildren * extraChildCharge;

    const perNightTotal =
      basePricePerNight + extraAdultCost + extraChildCost;

    const baseTotal = perNightTotal * totalNights;
    const taxAmount = Math.round(baseTotal * 0.1);
    const grandTotal = baseTotal + taxAmount;

    if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
      console.error("❌ Invalid amount calc", {
        basePricePerNight,
        extraAdultCost,
        extraChildCost,
        totalNights,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    console.log("🧾 Creating Razorpay order for:", grandTotal);

    const order = await razorpay.orders.create({
      amount: Math.round(grandTotal * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    if (!order?.id) {
      throw new Error("Razorpay order creation failed");
    }

    const booking = await Booking.create({
      userId,
      propertyId,
      checkIn,
      checkOut,
      guests: { adults, children, infants },
      meals: meals
        ? {
          includeMeals: true,
          veg: meals.veg,
          nonVeg: meals.nonVeg,
          combo: meals.combo,
        }
        : { includeMeals: false },
      totalNights,
      totalAmount: baseTotal,
      taxAmount,
      grandTotal,
      orderId: order.id,
      contactNumber,
      paymentMethod: "razorpay",
      paymentStatus: "initiated",
    });

    return res.status(200).json({
      success: true,
      order,
      booking,
    });

  } catch (err) {
    console.error("❌ createOrder error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Order creation failed",
    });
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
🧍‍♂️ *Guests:* ${typeof booking.guests === "number"
            ? booking.guests
            : `${booking.guests.adults + booking.guests.children} Guests` +
            (booking.guests.infants ? ` + ${booking.guests.infants} Infants` : "")
          }
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
      .populate("propertyId", "propertyName city state coverImage contactNumber")
      .populate("userId", "firstName lastName email mobile")
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => ({
      ...b._doc,
      property: b.propertyId,
      user: b.userId,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("getUserBookings error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
    });
  }
};



export const getBookingInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const requesterId = req.user?.id;

    const booking = await Booking.findById(bookingId)
      .populate("userId", "firstName lastName email mobile")
      .populate(
        "propertyId",
        "propertyName propertyType address city state ownerUserId resortOwner pricingPerNightWeekdays pricingPerNightWeekend"
      );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const subtotal = Number(booking.totalAmount);
    const taxAmount = Number(booking.taxAmount ?? Math.round(subtotal * 0.10));
    const grandTotal = Number(booking.grandTotal ?? subtotal + taxAmount);
    const perNight = Math.floor(subtotal / booking.totalNights);

    const invoiceData = {
      invoiceNumber: `INV-${booking._id.toString().slice(-6).toUpperCase()}`,

      propertyName: booking.propertyId.propertyName,
      propertyType: booking.propertyId.propertyType || "Accommodation",

      propertyAddress: [
        booking.propertyId.address,
        booking.propertyId.city,
        booking.propertyId.state,
      ].filter(Boolean).join(", "),

      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.totalNights,
      guests: booking.guests,

      totalAmount: subtotal,
      taxAmount,
      grandTotal,

      orderId: booking.orderId,
      bookingDate: booking.createdAt,
      paymentStatus: booking.paymentStatus,

      user: {
        name: `${booking.userId.firstName} ${booking.userId.lastName}`,
        mobile: booking.userId.mobile,
        email: booking.userId.email,
      },

      priceBreakdown: [
        {
          description: `${booking.propertyId.propertyType || "Accommodation"} Charges`,
          rate: `₹${perNight.toLocaleString()} × ${booking.totalNights} Nights`,
          total: `₹${subtotal.toLocaleString()}`,
        },
      ],
    };

    return res.json({ success: true, data: invoiceData });
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice",
    });
  }
};

