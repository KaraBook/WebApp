import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { normalizeMobile } from "../utils/phone.js";
import Razorpay from "razorpay";
import { getEffectiveOwnerId } from "../utils/getEffectiveOwner.js";
import { computePricing } from "../utils/pricing.js";


const genTempPassword = () => crypto.randomBytes(7).toString("base64url");

const ALLOWED_BOOKING_USER_ROLES = ["traveller"];

const getRelationshipRole = (user, ownerId) => {
  if (!user) return "traveller";

  const roles = getRoles(user);

  if (String(user._id) === String(ownerId)) {
    return "owner";
  }

  if (
    roles.includes("manager") &&
    user.createdBy &&
    String(user.createdBy) === String(ownerId)
  ) {
    return "manager";
  }

  if (roles.includes("resortOwner")) {
    return "traveller";
  }
  if (roles.includes("manager")) {
    return "traveller";
  }

  return "traveller";
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getRoles = (u) =>
  Array.isArray(u?.roles) ? u.roles : (u?.role ? [u.role] : []);

const hasRole = (u, role) => getRoles(u).includes(role);


export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = await getEffectiveOwnerId(req);
    const owner = await User.findById(ownerId).select("mobile email");

    /* ------------------ OWNER PROPERTIES ------------------ */
    const properties = await Property.find({
      $or: [
        { ownerUserId: ownerId },
        { "resortOwner.mobile": owner?.mobile },
        { "resortOwner.email": owner?.email },
      ],
    }).select("_id propertyName");

    const propertyIds = properties.map((p) => p._id);

    /* ------------------ BOOKINGS ------------------ */
    const bookings = await Booking.find({
      propertyId: { $in: propertyIds },
    })
      .populate("userId", "firstName lastName email mobile roles primaryRole")
      .populate("propertyId", "propertyName isRefundable cancellationPolicy coverImage")
      .lean();

    const uniqueTravellerIds = new Set();

    bookings.forEach((b) => {
      if (!b.userId) return;

      const relationshipRole = getRelationshipRole(b.userId, ownerId);

      if (relationshipRole === "traveller") {
        uniqueTravellerIds.add(b.userId._id.toString());
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isConfirmed = (b) => {
      if (b.cancelled === true) return false;

      return (
        b.paymentStatus === "paid" ||
        b.status === "confirmed" ||
        Boolean(b.paymentId)
      );
    };
    const confirmedBookings = bookings.filter(isConfirmed);

    const isRevenueBooking = (b) => {
      if (b.cancelled === true) return false;

      const isPaid =
        b.paymentStatus === "paid" ||
        b.status === "confirmed" ||
        Boolean(b.paymentId);

      if (!isPaid) return false;

      const checkout = new Date(b.checkOut);
      checkout.setHours(0, 0, 0, 0);

      return checkout < today;
    };
    const isPending = (b) =>
      b.paymentStatus === "initiated" && b.cancelled !== true;

    const isCancelled = (b) =>
      b.status === "cancelled" || b.cancelled === true;

    const revenueBookings = bookings.filter(isRevenueBooking);

    const netRevenue = revenueBookings.reduce(
      (sum, b) =>
        sum + Number(b.grandTotal ?? b.totalAmount ?? 0),
      0
    );

    const grossRevenue = netRevenue;
    const totalRefunds = 0;


    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const getMonthRevenue = (year, month) =>
      confirmedBookings
        .filter((b) => {
          const d = new Date(b.checkOut);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce(
          (sum, b) =>
            sum + Number(b.grandTotal ?? b.totalAmount ?? 0),
          0
        );

    const currentMonthRevenue = getMonthRevenue(currentYear, currentMonth);
    const prevMonthRevenue = getMonthRevenue(prevMonthYear, prevMonth);

    /* ------------------ GROWTH ------------------ */

    let growthPercent = null;
    let growthPositive = true;
    let growthText = "";

    if (prevMonthRevenue > 0 && currentMonthRevenue > 0) {
      growthPercent =
        ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;

      growthPositive = growthPercent >= 0;
      growthText = `${growthPositive ? "+" : ""}${growthPercent.toFixed(1)}% from last month`;
    } else if (prevMonthRevenue > 0 && currentMonthRevenue === 0) {
      growthPositive = false;
      growthText = "-100% from last month";
    } else if (prevMonthRevenue === 0 && currentMonthRevenue > 0) {
      growthPositive = true;
      growthText = "New revenue this month";
    } else {
      growthPositive = true;
      growthText = "No revenue data yet";
    }

    /* ------------------ FINAL STATS ------------------ */

    const stats = {
      totalProperties: properties.length,
      totalBookings: bookings.length,
      totalUsers: uniqueTravellerIds.size,

      confirmed: confirmedBookings.length,
      pending: bookings.filter(isPending).length,
      cancelled: bookings.filter(isCancelled).length,

      grossRevenue,
      totalRefunds,
      netRevenue,
      currentMonthRevenue,
      prevMonthRevenue,
      growthPercent,
      growthPositive,
      growthText,
    };

    /* ------------------ RESPONSE ------------------ */
    return res.json({
      success: true,
      data: {
        stats,
        properties,
        bookings,
      },
    });

  } catch (err) {
    console.error("getOwnerDashboard error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};



export const getOwnerProperties = async (req, res) => {
  try {
    const ownerId = await getEffectiveOwnerId(req);
    const owner = await User.findById(ownerId).select("mobile email");
    const properties = await Property.find({
      $or: [
        { ownerUserId: ownerId },
        { "resortOwner.mobile": owner?.mobile },
        { "resortOwner.email": owner?.email },
      ],
    });
    res.json({ success: true, data: properties });
  } catch (err) {
    console.error("getOwnerProperties error:", err);
    res.status(500).json({ success: false, message: "Failed to load properties" });
  }
};

export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = await getEffectiveOwnerId(req);
    const owner = await User.findById(ownerId).select("mobile email");

    const properties = await Property.find({
      $or: [
        { ownerUserId: ownerId },
        { "resortOwner.mobile": owner?.mobile },
        { "resortOwner.email": owner?.email },
      ],
    }).select("_id");

    const propertyIds = properties.map((p) => p._id);

    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate("propertyId", "propertyName isRefundable cancellationPolicy coverImage")
      .populate("userId", "firstName lastName email mobile roles primaryRole");

    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error("getOwnerBookings error:", err);
    res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
};


export const getSingleOwnerProperty = async (req, res) => {
  try {
    const ownerId = await getEffectiveOwnerId(req);
    const owner = await User.findById(ownerId).select("mobile email");

    const property = await Property.findOne({
      _id: req.params.id,
      $or: [
        { ownerUserId: ownerId },
        { "resortOwner.mobile": owner?.mobile },
        { "resortOwner.email": owner?.email },
      ],
    });

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    res.json({ success: true, data: property });
  } catch (err) {
    console.error("getSingleOwnerProperty error:", err);
    res.status(500).json({ success: false, message: "Failed to load property" });
  }
};



export const updateOwnerProperty = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const ownerId = await getEffectiveOwnerId(req);
    const propertyId = req.params.id;

    const owner = await User.findById(ownerId).select("mobile email");

    const existingProperty = await Property.findOne({
      _id: propertyId,
      $or: [
        { ownerUserId: ownerId },
        { "resortOwner.mobile": owner?.mobile },
        { "resortOwner.email": owner?.email },
      ],
    });

    if (!existingProperty) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this property",
      });
    }

    if (existingProperty.isDraft || !existingProperty.publishNow) {
      return res.status(403).json({
        success: false,
        message: "Draft or unpublished properties cannot be edited by owner.",
      });
    }

    const allowedFields = [
      "description",
      "maxGuests",
      "baseGuests",
      "pricingPerNightWeekdays",
      "pricingPerNightWeekend",
      "extraAdultCharge",
      "extraChildCharge",
      "checkInTime",
      "checkOutTime",
      "foodAvailability",
      "minStayNights",
      "amenities",
      "roomBreakdown",
      "bedrooms",
      "bathrooms",
      "isRefundable",
      "refundNotes",
      "cancellationPolicy"
    ];

    const body = req.body;

    const parseJSON = (val, fallback) => {
      try {
        if (typeof val === "string") return JSON.parse(val);
        return val ?? fallback;
      } catch {
        return fallback;
      }
    };

    body.roomBreakdown = parseJSON(body.roomBreakdown, {});
    body.amenities = parseJSON(body.amenities, []);
    body.foodAvailability = parseJSON(body.foodAvailability, []);
    body.cancellationPolicy = parseJSON(body.cancellationPolicy, []);
    const updatedData = {};

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updatedData[field] = body[field];
      }
    });

    if (updatedData.minStayNights === undefined) {
      updatedData.minStayNights = existingProperty.minStayNights;
    }

    [
      "maxGuests",
      "baseGuests",
      "pricingPerNightWeekdays",
      "pricingPerNightWeekend",
      "extraAdultCharge",
      "extraChildCharge",
      "minStayNights",
    ].forEach((f) => {
      if (updatedData[f] !== undefined) {
        updatedData[f] = Number(updatedData[f]);
      }
    });

    if (
      updatedData.baseGuests !== undefined &&
      updatedData.maxGuests !== undefined &&
      updatedData.baseGuests > updatedData.maxGuests
    ) {
      return res.status(400).json({
        success: false,
        message: "Base guests cannot be greater than max guests",
      });
    }

    if (body.roomBreakdown) {
      const rb = {
        ac: Number(body.roomBreakdown.ac || 0),
        nonAc: Number(body.roomBreakdown.nonAc || 0),
        deluxe: Number(body.roomBreakdown.deluxe || 0),
        luxury: Number(body.roomBreakdown.luxury || 0),
        hall: Number(body.roomBreakdown.hall || 0),
      };

      rb.total = rb.ac + rb.nonAc + rb.deluxe + rb.luxury + rb.hall;

      updatedData.roomBreakdown = rb;
    }

    const files = req.files || {};

    let removed = [];

    if (body.removedGalleryImages) {
      removed = Array.isArray(body.removedGalleryImages)
        ? body.removedGalleryImages
        : [body.removedGalleryImages];
    }

    if (body["removedGalleryImages[]"]) {
      let arr = body["removedGalleryImages[]"];
      arr = Array.isArray(arr) ? arr : [arr];
      removed = [...removed, ...arr];
    }

    if (removed.length > 0) {
      existingProperty.galleryPhotos = existingProperty.galleryPhotos.filter(
        (img) => !removed.includes(img)
      );

      updatedData.galleryPhotos = existingProperty.galleryPhotos;
    }

    if (body.removedCoverImage === "true") {
      updatedData.coverImage = "";
    }

    if (body.removedShopAct === "true") {
      updatedData.shopAct = "";
    }

    if (files.coverImage?.[0]) {
      const file = files.coverImage[0];
      updatedData.coverImage = `/uploads/properties/cover/${file.filename}`;
    }

    if (files.shopAct?.[0]) {
      const file = files.shopAct[0];
      updatedData.shopAct = `/uploads/properties/shopAct/${file.filename}`;
    }

    if (files.galleryPhotos?.length > 0) {
      const newGallery = files.galleryPhotos.map(
        (file) => `/uploads/properties/gallery/${file.filename}`
      );

      updatedData.galleryPhotos = [
        ...(existingProperty.galleryPhotos || []),
        ...newGallery,
      ];
    } else if (!updatedData.galleryPhotos) {
      updatedData.galleryPhotos = existingProperty.galleryPhotos;
    }

    const finalCover =
      updatedData.coverImage || existingProperty.coverImage;
    const finalGallery =
      updatedData.galleryPhotos || existingProperty.galleryPhotos || [];

    if (!finalCover) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required",
      });
    }

    if (!Array.isArray(finalGallery) || finalGallery.length < 3) {
      return res.status(400).json({
        success: false,
        message: "At least 3 gallery photos are required",
      });
    }


    if (updatedData.isRefundable === false) {
      updatedData.refundNotes = "";
      updatedData.cancellationPolicy = [
        { minDaysBefore: 0, refundPercent: 0 }
      ];
    }

    if (
      updatedData.isRefundable === true &&
      (!Array.isArray(updatedData.cancellationPolicy) ||
        updatedData.cancellationPolicy.length === 0)
    ) {
      updatedData.cancellationPolicy = [
        { minDaysBefore: 14, refundPercent: 100 },
        { minDaysBefore: 7, refundPercent: 50 },
        { minDaysBefore: 0, refundPercent: 0 },
      ];
    }

    let updatedProperty;

    await session.withTransaction(async () => {
      updatedProperty = await Property.findByIdAndUpdate(
        propertyId,
        { $set: updatedData },
        { new: true, runValidators: true, session }
      );
    });

    return res.status(200).json({
      success: true,
      data: updatedProperty,
      message: "Property updated successfully",
    });
  } catch (err) {
    console.error("Owner Update Error:", err);

    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate value found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  } finally {
    session.endSession();
  }
};





export const getPropertyBlockedDates = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id)
      .select("blockedDates propertyName")
      .lean();

    if (!property)
      return res.status(404).json({ success: false, message: "Property not found" });

    res.json({ success: true, dates: property.blockedDates || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


export const addBlockedDates = async (req, res) => {
  try {
    console.log(" addBlockedDates hit");
    console.log("Body received:", req.body);
    console.log("Params received:", req.params);

    const { id } = req.params;
    const { start, end, reason } = req.body;

    console.log(" addBlockedDates hit", { id, start, end, reason });

    if (!start || !end) {
      console.error(" Missing start or end date:", req.body);
      return res
        .status(400)
        .json({ success: false, message: "Start and End dates are required" });
    }

    const property = await Property.findById(id);
    if (!property) {
      console.error("❌ Property not found for ID:", id);
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate)) {
      console.error("❌ Invalid date format:", { startDate, endDate });
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    const isOverlap = (property.blockedDates || []).some((range) => {
      const existingStart = new Date(range.start);
      const existingEnd = new Date(range.end);
      return startDate <= existingEnd && endDate >= existingStart;
    });

    if (isOverlap) {
      console.warn("⚠️ Duplicate/overlapping date range blocked");
      return res
        .status(409)
        .json({ success: false, message: "These dates are already blocked" });
    }

    property.blockedDates.push({
      start: startDate,
      end: endDate,
      reason: reason || "Owner blocked these dates",
      addedByOwner: true,
    });

    await property.save({ validateBeforeSave: false });

    console.log("✅ Dates blocked successfully for property:", id);

    res.json({
      success: true,
      message: "Dates blocked successfully",
      data: property.blockedDates,
    });
  } catch (err) {
    console.error("🔥 addBlockedDates Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to block dates",
      error: err.message,
    });
  }
};



export const removeBlockedDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end dates required",
      });
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const beforeCount = property.blockedDates.length;

    property.blockedDates = property.blockedDates.filter((b) => {
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);
      return !(startDate <= bEnd && endDate >= bStart);
    });

    if (property.blockedDates.length === beforeCount) {
      return res.status(404).json({
        success: false,
        message: "No matching blocked range found",
      });
    }

    await property.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: "Dates unblocked",
      data: property.blockedDates,
    });
  } catch (err) {
    console.error("❌ removeBlockedDates error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to unblock dates",
      error: err.message,
    });
  }
};



export const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: bookingId,
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Order create failed" });
  }
};


export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (expected !== signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const booking = await Booking.findById(bookingId);

    booking.paymentMethod = "razorpay";
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.paymentId = paymentId;
    booking.orderId = orderId;

    await booking.save();

    res.json({ success: true, message: "Payment verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};


export const createOfflineBooking = async (req, res) => {
  try {
    const {
      traveller,
      propertyId,
      checkIn,
      checkOut,
      guests,
      meals,
    } = req.body;

    const ownerId = await getEffectiveOwnerId(req);

    if (!propertyId) {
      return res.status(400).json({ success: false, message: "Property ID missing" });
    }

    if (!traveller || !traveller.mobile) {
      return res.status(400).json({ success: false, message: "Traveller mobile missing" });
    }

    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: "Check-in & check-out required" });
    }

    const property = await Property.findById(propertyId).lean();
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const totalNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (totalNights <= 0) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }


    const adults = Number(guests?.adults || 0);
    const children = Number(guests?.children || 0);
    const totalGuests = adults + children;

    if (!totalGuests || totalGuests <= 0) {
      return res.status(400).json({
        success: false,
        message: "At least one guest is required",
      });
    }

    if (totalGuests > Number(property.maxGuests)) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${property.maxGuests} guests allowed`,
      });
    }

    if (meals) {
      const veg = Number(meals.veg || 0);
      const nonVeg = Number(meals.nonVeg || 0);

      if (veg + nonVeg > totalGuests) {
        return res.status(400).json({
          success: false,
          message: "Meal guests cannot exceed total guests",
        });
      }
    }

    if (!grandTotal || grandTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }
    const normalizedMobile = normalizeMobile(traveller.mobile);
    if (!normalizedMobile || normalizedMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid traveller mobile number",
      });
    }

    const pricing = computePricing(
      {
        checkIn,
        checkOut,
        guests: { adults, children },
        meals: meals?.includeMeals
          ? { veg: meals.veg || 0, nonVeg: meals.nonVeg || 0 }
          : { veg: 0, nonVeg: 0 },
        totalNights
      },
      property
    );

    const {
      subtotal,
      tax,
      cgst,
      sgst,
      grandTotal
    } = pricing;

    if (!grandTotal || grandTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    let user = await User.findOne({ mobile: normalizedMobile });

    if (user) {
      const fields = [
        "firstName",
        "lastName",
        "email",
        "state",
        "city",
        "dateOfBirth",
        "address",
        "pinCode",
      ];

      const roles = getRoles(user);

      if (!roles.includes("traveller")) {
        user.roles = [...new Set([...roles, "traveller"])];
        user.primaryRole = user.primaryRole || "traveller";
        await user.save();
      }

      let updated = false;
      fields.forEach((field) => {
        if (!user[field] && traveller[field]) {
          user[field] = traveller[field];
          updated = true;
        }
      });

      if (updated) await user.save();
    } else {
      user = await User.create({
        firstName: traveller.firstName,
        lastName: traveller.lastName,
        name: `${traveller.firstName} ${traveller.lastName}`.trim(),
        email: traveller.email?.toLowerCase().trim(),
        mobile: normalizedMobile,
        dateOfBirth: traveller.dateOfBirth ? new Date(traveller.dateOfBirth) : null,
        address: traveller.address,
        pinCode: traveller.pinCode,
        state: traveller.state,
        city: traveller.city,
        roles: ["traveller"],
        primaryRole: "traveller",
      });
    }

    const booking = await Booking.create({
      userId: user._id,
      propertyId,
      isRefundable: property.isRefundable,
      cancellationPolicy: property.cancellationPolicy,
      checkIn,
      checkOut,
      guests: { adults, children },
      meals: meals?.includeMeals
        ? {
          includeMeals: true,
          veg: meals.veg,
          nonVeg: meals.nonVeg,
        }
        : { includeMeals: false },
      totalNights,
      totalAmount: subtotal,
      taxAmount: tax,
      cgstAmount: cgst,
      sgstAmount: sgst,
      grandTotal,
      bookedBy: ownerId,
      isOffline: true,
      paymentMethod: "razorpay",
      paymentStatus: "initiated",
    });

    return res.json({
      success: true,
      booking,
    });

  } catch (err) {
    console.error("🔥 Offline Booking Error:", err);
    return res.status(500).json({
      success: false,
      message: "Offline booking failed",
      error: err.message,
    });
  }
};




export const checkTravellerByMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const normalized = normalizeMobile(mobile);

    if (!normalized || normalized.length !== 10)
      return res.status(400).json({ success: false, message: "Invalid mobile number" });

    const traveller = await User.findOne({
      mobile: normalized,
      roles: "traveller",
    });

    if (traveller) {
      return res.json({
        success: true,
        exists: true,
        traveller: {
          firstName: traveller.firstName,
          lastName: traveller.lastName,
          email: traveller.email,
          mobile: traveller.mobile,
          dateOfBirth: traveller.dateOfBirth,
          address: traveller.address,
          pinCode: traveller.pinCode,
          state: traveller.state,
          city: traveller.city,
        },
      });
    }

    return res.json({ success: true, exists: false });
  } catch (err) {
    console.error("checkTravellerByMobile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const checkOwnerByMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const normalized = normalizeMobile(mobile);

    if (!normalized || normalized.length !== 10)
      return res.status(400).json({ success: false, message: "Invalid mobile number" });

    const owner = await User.findOne({
      mobile: normalized,
      roles: { $in: ["resortOwner", "manager", "admin"] },
    }).select("roles primaryRole");

    if (owner) {
      return res.json({
        success: true,
        exists: true,
        role: owner.primaryRole || (owner.roles?.[0] || null),
        message: "Number belongs to a resort owner"
      });
    }

    return res.json({ success: true, exists: false });
  } catch (err) {
    console.error("checkOwnerByMobile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const getBookedDates = async (req, res) => {
  try {
    const { id } = req.params;

    const bookings = await Booking.find({
      propertyId: id,
      cancelled: { $ne: true },
      $or: [
        { paymentStatus: "paid" },
        { status: "confirmed" },
        { paymentId: { $exists: true, $ne: null } },
      ],
    }).select("checkIn checkOut");

    const formatted = bookings.map((b) => ({
      start: b.checkIn,
      end: b.checkOut,
    }));

    res.json({ success: true, dates: formatted });
  } catch (err) {
    console.error("getBookedDates error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load booked dates",
      error: err.message,
    });
  }
};


export const getOwnerBookedUsers = async (req, res) => {
  try {
    const ownerId = await getEffectiveOwnerId(req);
    const owner = await User.findById(ownerId).select("mobile email");

    /* 1️⃣ Owner properties ONLY */
    const properties = await Property.find({
      $or: [
        { ownerUserId: ownerId },
        { "resortOwner.mobile": owner?.mobile },
        { "resortOwner.email": owner?.email },
      ],
    }).select("_id");

    const propertyIds = properties.map(p => p._id);

    const bookings = await Booking.find({
      propertyId: { $in: propertyIds },
      paymentStatus: { $in: ["paid", "initiated"] },
    })
      .populate("userId", "firstName lastName email mobile city state roles primaryRole createdAt")
      .populate("propertyId", "propertyName")
      .lean();

    const usersMap = {};

    bookings.forEach((b) => {
      if (!b.userId) return;

      if (!b.userId) return;

      const uid = b.userId._id.toString();

      const relationshipRole = getRelationshipRole(b.userId, ownerId);

      usersMap[uid] = {
        userId: b.userId._id,
        firstName: b.userId.firstName,
        lastName: b.userId.lastName,
        email: b.userId.email,
        mobile: b.userId.mobile,
        city: b.userId.city,
        state: b.userId.state,
        roles: b.userId.roles || [],
        primaryRole: b.userId.primaryRole || null,
        relationshipRole,
        createdAt: b.userId.createdAt,
        totalBookings: 0,
        lastBookingDate: b.createdAt,
        properties: new Set(),
      };

      usersMap[uid].totalBookings += 1;

      if (b.propertyId?.propertyName) {
        usersMap[uid].properties.add(b.propertyId.propertyName);
      }

      if (new Date(b.createdAt) > new Date(usersMap[uid].lastBookingDate)) {
        usersMap[uid].lastBookingDate = b.createdAt;
      }
    });

    const managers = await User.find({
      roles: "manager",
      createdBy: ownerId,
    }).select("name firstName lastName email mobile city state roles primaryRole createdAt").lean();

    managers.forEach((m) => {
      const uid = m._id.toString();

      if (!usersMap[uid]) {
        usersMap[uid] = {
          userId: m._id,
          firstName: m.firstName || m.name || "",
          lastName: m.lastName || "",
          email: m.email,
          mobile: m.mobile,
          city: m.city,
          state: m.state,
          roles: m.roles || [],
          primaryRole: m.primaryRole || null,
          relationshipRole: "manager",
          createdAt: m.createdAt,
          totalBookings: 0,
          lastBookingDate: null,
          properties: [],
        };
      }
    });

    /* 5️⃣ Final response */
    const users = Object.values(usersMap).map((u) => ({
      ...u,
      properties: Array.from(u.properties || []),
    }));

    return res.json({
      success: true,
      data: users,
    });

  } catch (err) {
    console.error("getOwnerBookedUsers error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
};



export const ownerCancelBooking = async (req, res) => {
  try {
    const ownerId = await getEffectiveOwnerId(req);
    const { bookingId } = req.params;
    const { reason, notes, refundPercent } = req.body;

    if (
      refundPercent === undefined ||
      typeof refundPercent !== "number" ||
      refundPercent < 0 ||
      refundPercent > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund percentage (0–100 allowed)"
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("propertyId");

    if (!booking || booking.cancelled) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or already cancelled"
      });
    }

    const property = booking.propertyId;

    const owner = await User.findById(ownerId).select("mobile email").lean();

    const authorized =
      String(property.ownerUserId) === String(ownerId) ||
      (owner?.mobile &&
        normalizeMobile(owner.mobile) === normalizeMobile(property?.resortOwner?.mobile)) ||
      (owner?.email &&
        owner.email.toLowerCase() === String(property?.resortOwner?.email || "").toLowerCase());

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid bookings can be cancelled"
      });
    }

    const baseAmount = Number(booking.grandTotal ?? booking.totalAmount ?? 0);
    if (!baseAmount || baseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount for refund",
      });
    }

    const refundAmount = Math.round((baseAmount * refundPercent) / 100);

    let refund = null;
    if (booking.paymentId && refundAmount > 0) {
      refund = await razorpay.payments.refund(
        booking.paymentId,
        { amount: refundAmount * 100 }
      );
    }

    booking.cancelled = true;
    booking.cancelledBy = "owner";
    booking.cancelReason = reason;
    booking.cancelNotes = notes;

    booking.ownerRefundPercent = refundPercent;
    booking.refundAmount = refundAmount;
    booking.refundId = refund?.id;
    booking.refundStatus = refund ? "initiated" : "completed";
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({
      success: true,
      refundAmount,
      refundPercent,
      message: "Booking cancelled by owner"
    });

  } catch (err) {
    console.error("ownerCancelBooking error:", err);
    res.status(500).json({
      success: false,
      message: "Owner cancellation failed"
    });
  }
};