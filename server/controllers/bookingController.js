import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import { sendMail } from "../utils/mailer.js";
import { bookingConfirmationTemplate } from "../utils/emailTemplates.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import { sendWhatsAppText } from "../utils/whatsapp.js";
import { computePricing } from "../utils/pricing.js";
import Review from "../models/Review.js";
import { computeRefund } from "../utils/cancellation.js";


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

    const start = parseLocalDate(checkIn);
    const end = parseLocalDate(checkOut);
    const today = new Date();

    const startDateOnly = start.toISOString().slice(0, 10);
    const endDateOnly = end.toISOString().slice(0, 10);
    const todayDateOnly = today.toISOString().slice(0, 10);

    if (startDateOnly <= todayDateOnly) {
      return res.status(400).json({
        success: false,
        message: "Same-day bookings are not allowed. Please select a future date.",
      });
    }

    if (endDateOnly <= startDateOnly) {
      return res.status(400).json({
        success: false,
        message: "Minimum stay is 1 night. Please select different dates.",
      });
    }

    let totalNights = 0;
    let cursor = new Date(start);

    while (cursor < end) {
      totalNights++;
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }

    if (!totalNights || totalNights <= 0) {
      return res.status(400).json({
        success: false,
        message: "Minimum stay is 1 night. Please select different dates."
      });
    }

    const adults = Number(guests?.adults || 0);
    const children = Number(guests?.children || 0);
    const totalGuests = adults + children;

    if (totalGuests > Number(property.maxGuests)) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${property.maxGuests} guests allowed`,
      });
    }

    // Meal validations
    if (meals?.includeMeals) {
      const totalMeals =
        Number(meals.veg || 0) +
        Number(meals.nonVeg || 0);

      if (totalMeals < 1) {
        return res.status(400).json({
          success: false,
          message: "Select at least 1 meal",
        });
      }

      if (totalMeals > totalGuests) {
        return res.status(400).json({
          success: false,
          message: "Meal count cannot exceed total guests",
        });
      }
    }

    // 🔥 ONLY pricing engine
    const pricing = computePricing(
      {
        checkIn,
        checkOut,
        guests: { adults, children },
        meals: meals
          ? { veg: meals.veg, nonVeg: meals.nonVeg }
          : { veg: 0, nonVeg: 0 },
        totalNights
      },
      property
    );

    const { subtotal, tax, grandTotal } = pricing;

    if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
      console.error("❌ Invalid pricing", pricing);
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    const existingPending = await Booking.findOne({
      userId,
      propertyId,
      checkIn,
      checkOut,
      paymentStatus: "initiated",
      cancelled: { $ne: true }
    });

    console.log("🧾 Creating Razorpay order for:", grandTotal);

    const order = await razorpay.orders.create({
      amount: Math.round(grandTotal * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    if (!order?.id) {
      throw new Error("Razorpay order creation failed");
    }

    if (existingPending) {
      console.log("♻️ Reusing existing pending booking");

      existingPending.orderId = order.id;
      existingPending.totalAmount = subtotal;
      existingPending.taxAmount = tax;
      existingPending.grandTotal = grandTotal;
      existingPending.contactNumber = contactNumber;
      existingPending.guests = { adults, children };

      await existingPending.save();

      return res.status(200).json({
        success: true,
        order,
        booking: existingPending,
        pricing
      });
    }


    const booking = await Booking.create({
      userId,
      propertyId,
      checkIn,
      checkOut,
      guests: { adults, children },
      meals: meals
        ? {
          includeMeals: true,
          veg: meals.veg,
          nonVeg: meals.nonVeg,
        }
        : { includeMeals: false },
      totalNights,
      isRefundable: property.isRefundable,
      cancellationPolicy: property.cancellationPolicy,
      refundNotes: property.refundNotes,
      totalAmount: subtotal,
      taxAmount: tax,
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
      pricing,
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
      {
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        status: "confirmed",
      },
      { new: true }
    )
      .populate(
        "propertyId",
        `
  propertyName
  city
  state
  addressLine1
  coverImage
  contactNumber
  checkInTime
  checkOutTime
  isRefundable
  cancellationPolicy
  refundNotes
  `
      )
      .populate("userId", "firstName lastName email mobile")
      .populate("propertyId", "propertyName city state address");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    console.log("✅ Payment verified for:", booking._id);

    await Booking.updateMany(
      {
        userId: booking.userId?._id || booking.userId,
        propertyId: booking.propertyId?._id || booking.propertyId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        _id: { $ne: booking._id },
        paymentStatus: "initiated"
      },
      {
        $set: {
          status: "cancelled",
          cancelled: true,
          cancelledBy: "system",
          cancelReason: "Duplicate pending booking auto-closed"
        }
      }
    );

    if (booking.userId?.email) {
      const mailData = bookingConfirmationTemplate({
        travellerName: `${booking.userId.firstName} ${booking.userId.lastName}`,
        propertyName: booking.propertyId.propertyName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.totalNights,
        guests: `${booking.guests.adults} Adults, ${booking.guests.children} Children`,

        subtotal: booking.totalAmount,
        taxAmount: booking.taxAmount,
        grandTotal: booking.grandTotal,
        paymentMethod: booking.paymentMethod,
        orderId: booking.orderId,

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

📅 Check-in: ${new Date(booking.checkIn).toLocaleDateString("en-IN")}
📅 Check-out: ${new Date(booking.checkOut).toLocaleDateString("en-IN")}
🧍 Guests: ${booking.guests.adults + booking.guests.children}
💰 Amount Paid: ₹${booking.grandTotal.toLocaleString("en-IN")}
📍 Location: ${booking.propertyId.city}, ${booking.propertyId.state}

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
      cancelled: { $ne: true }
    }).select("checkIn checkOut");

    const dates = bookings.map((b) => ({
      start: b.checkIn,
      end: b.checkOut,
    }));

    res.json({ success: true, dates });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};


export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .populate(
        "propertyId",
        "propertyName city state coverImage contactNumber isRefundable cancellationPolicy refundNotes"
      )
      .populate("userId", "firstName lastName email mobile")
      .sort({ createdAt: -1 })
      .lean();

    const bookingIds = bookings.map(b => b._id);

    const reviews = await Review.find({
      userId,
      bookingId: { $in: bookingIds }
    }).select("bookingId");

    const reviewedMap = {};
    reviews.forEach(r => {
      reviewedMap[r.bookingId.toString()] = true;
    });

    const formatted = bookings.map((b) => ({
      ...b,
      property: b.propertyId,
      user: b.userId,
      hasReview: !!reviewedMap[b._id.toString()],
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

    const booking = await Booking.findById(bookingId)
      .populate("userId", "firstName lastName email mobile")
      .populate(
        "propertyId",
        "propertyName city state coverImage contactNumber isRefundable cancellationPolicy refundNotes"
      )

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const subtotal = booking.totalAmount;
    const taxAmount = booking.taxAmount;
    const grandTotal = booking.grandTotal;
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
      meals: booking.meals,

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



export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: userId
    })
      .populate(
        "propertyId",
        `
        propertyName
        city
        state
        addressLine1
        coverImage
        contactNumber
        checkInTime
        checkOutTime
        isRefundable
        cancellationPolicy
        refundNotes
        `
      )
      .populate("userId", "firstName lastName email mobile");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({ success: true, data: booking });

  } catch (err) {
    console.error("getBookingById error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking"
    });
  }
};




export const previewPricing = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests, meals } = req.body;

    const property = await Property.findById(propertyId).lean();
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const start = parseLocalDate(checkIn);
    const end = parseLocalDate(checkOut);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    let totalNights = 0;
    let cursor = new Date(start);

    while (cursor < end) {
      totalNights++;
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }

    const pricing = computePricing(
      {
        checkIn,
        checkOut,
        guests,
        meals: meals || { veg: 0, nonVeg: 0 },
        totalNights
      },
      property
    );

    res.json({ success: true, pricing });

  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to preview pricing" });
  }
};



export const previewCancellation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      cancelled: { $ne: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or already cancelled"
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid bookings can be cancelled"
      });
    }

    const property = await Property.findById(booking.propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const result = computeRefund(booking, property);

    res.json({ success: true, ...result });

  } catch (err) {
    console.error("previewCancellation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to preview cancellation"
    });
  }
};



export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason, notes } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      cancelled: { $ne: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or already cancelled"
      });
    }

    const property = await Property.findById(booking.propertyId);

    const { refundAmount } = computeRefund(booking, property);

    let refund = null;
    if (refundAmount > 0 && booking.paymentId) {
      refund = await razorpay.payments.refund(
        booking.paymentId,
        { amount: refundAmount * 100 }
      );
    }

    booking.cancelled = true;
    booking.cancelledBy = "traveller";
    booking.cancelReason = reason;
    booking.cancelNotes = notes;
    booking.refundAmount = refundAmount;
    booking.refundId = refund?.id;
    booking.refundStatus = refund ? "initiated" : "completed";
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({
      success: true,
      refundAmount,
      propertyId: booking.propertyId
    });

  } catch (err) {
    console.error("cancelBooking error:", err);
    res.status(500).json({ success: false, message: "Cancellation failed" });
  }
};