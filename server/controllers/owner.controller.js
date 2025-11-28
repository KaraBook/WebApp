import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prepareImage, uploadBuffer } from "../utils/cloudinary.js";
import { normalizeMobile } from "../utils/phone.js";
import Razorpay from "razorpay";

const genTempPassword = () => crypto.randomBytes(7).toString("base64url");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const owner = await User.findById(ownerId).select("mobile email");

    const properties = await Property.find({
      $or: [
        { ownerUserId: ownerId },
        { "resortOwner.mobile": owner?.mobile },
        { "resortOwner.email": owner?.email },
      ],
    });

    const propertyIds = properties.map((p) => p._id);

    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate("userId", "firstName lastName mobile")
      .populate("propertyId", "propertyName");

    const stats = {
      totalProperties: properties.length,
      totalBookings: bookings.length,
      confirmed: bookings.filter((b) => b.paymentStatus === "paid").length,
      pending: bookings.filter((b) => b.paymentStatus === "pending").length,
      failed: bookings.filter((b) => b.paymentStatus === "failed").length,
      totalRevenue: bookings
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    };

    res.json({ success: true, data: { stats, properties, bookings } });
  } catch (err) {
    console.error("getOwnerDashboard error:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard" });
  }
};

export const getOwnerProperties = async (req, res) => {
  try {
    const owner = await User.findById(req.user.id).select("mobile email");
    const properties = await Property.find({
      $or: [
        { ownerUserId: req.user.id },
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
    const owner = await User.findById(req.user.id).select("mobile email");

    const properties = await Property.find({
      $or: [
        { ownerUserId: req.user.id },
        { "resortOwner.mobile": owner?.mobile },
        { "resortOwner.email": owner?.email },
      ],
    }).select("_id");

    const propertyIds = properties.map((p) => p._id);

    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate("propertyId", "propertyName")
      .populate("userId", "firstName lastName mobile");

    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error("getOwnerBookings error:", err);
    res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
};


export const getSingleOwnerProperty = async (req, res) => {
  try {
    const owner = await User.findById(req.user.id).select("mobile email");

    const property = await Property.findOne({
      _id: req.params.id,
      $or: [
        { ownerUserId: req.user.id },
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
    const ownerId = req.user.id;
    const propertyId = req.params.id;

    const existingProperty = await Property.findOne({
      _id: propertyId,
      ownerUserId: ownerId,
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
      "pricingPerNightWeekdays",
      "pricingPerNightWeekend",
      "extraGuestCharge",
      "checkInTime",
      "checkOutTime",
      "foodAvailability",
      "amenities",
      "petFriendly",
      "roomBreakdown",
    ];

    const body = req.body;
    const updatedData = {};

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updatedData[field] = body[field];
      }
    });

    if (
      body["roomBreakdown[ac]"] ||
      body["roomBreakdown[nonAc]"] ||
      body["roomBreakdown[deluxe]"] ||
      body["roomBreakdown[luxury]"]
    ) {
      const rb = {
        ac: Number(body["roomBreakdown[ac]"] ?? 0),
        nonAc: Number(body["roomBreakdown[nonAc]"] ?? 0),
        deluxe: Number(body["roomBreakdown[deluxe]"] ?? 0),
        luxury: Number(body["roomBreakdown[luxury]"] ?? 0),
      };

      rb.total = rb.ac + rb.nonAc + rb.deluxe + rb.luxury;
      updatedData.roomBreakdown = rb;
      updatedData.totalRooms = rb.total;
    }

    const files = req.files || {};

    if (files.coverImage?.[0]) {
      const processed = await prepareImage(files.coverImage[0].buffer);
      const result = await uploadBuffer(processed, { folder: "properties" });
      updatedData.coverImage = result.secure_url;
    }

    if (files.shopAct?.[0]) {
      const processed = await prepareImage(files.shopAct[0].buffer);
      const result = await uploadBuffer(processed, {
        folder: "properties/shopAct",
      });
      updatedData.shopAct = result.secure_url;
    }

    if (files.galleryPhotos?.length > 0) {
      const galleryResults = await Promise.all(
        files.galleryPhotos.map(async (f) => {
          const processed = await prepareImage(f.buffer);
          const result = await uploadBuffer(processed, {
            folder: "properties/gallery",
          });
          return result.secure_url;
        })
      );

      updatedData.galleryPhotos = [
        ...(existingProperty.galleryPhotos || []),
        ...galleryResults,
      ];
    } else {
      updatedData.galleryPhotos = existingProperty.galleryPhotos;
    }


    const finalCover = updatedData.coverImage || existingProperty.coverImage;
    const finalGallery =
      updatedData.galleryPhotos || existingProperty.galleryPhotos || [];

    if (!finalCover) {
      return res
        .status(400)
        .json({ success: false, message: "Cover image is required" });
    }

    if (!Array.isArray(finalGallery) || finalGallery.length < 3) {
      return res.status(400).json({
        success: false,
        message: "At least 3 gallery photos are required",
      });
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

    res.status(500).json({
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

    const isOverlap = property.blockedDates.some((range) => {
      const existingStart = new Date(range.start);
      const existingEnd = new Date(range.end);
      return (
        (startDate >= existingStart && startDate <= existingEnd) ||
        (endDate >= existingStart && endDate <= existingEnd)
      );
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
    const { start, end } = req.body;

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    property.blockedDates = property.blockedDates.filter(
      (b) => !(new Date(b.start).getTime() === new Date(start).getTime() &&
        new Date(b.end).getTime() === new Date(end).getTime())
    );
    await property.save();

    res.json({ success: true, message: "Dates unblocked", data: property.blockedDates });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to unblock dates", error: err.message });
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
      totalAmount
    } = req.body;

    const ownerId = req.user.id;

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

    const weekdayPrice = Number(property.pricingPerNightWeekdays || 0);
    const weekendPrice = Number(property.pricingPerNightWeekend || 0);

    let backendTotal = 0;
    let d = new Date(checkIn);
    const end = new Date(checkOut);

    while (d < end) {
      const day = d.getDay();
      const isWeekend = day === 0 || day === 6;
      backendTotal += isWeekend ? weekendPrice : weekdayPrice;
      d.setDate(d.getDate() + 1);
    }
    if (backendTotal !== Number(totalAmount)) {
      return res.status(400).json({
        success: false,
        message: "Price mismatch! Please refresh and try again."
      });
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const normalized = normalizeMobile(traveller.mobile);
    if (!normalized || normalized.length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid traveller number" });
    }

    let user = await User.findOne({ mobile: normalized });

    if (user) {
      const fields = ["firstName", "lastName", "email", "state", "city", "dateOfBirth", "address", "pinCode"];
      let updated = false;

      fields.forEach((f) => {
        if (!user[f] && traveller[f]) {
          user[f] = traveller[f];
          updated = true;
        }
      });

      if (updated) await user.save();

    } else {
      user = await User.create({
        firstName: traveller.firstName,
        lastName: traveller.lastName,
        name: `${traveller.firstName} ${traveller.lastName}`,
        email: traveller.email,
        mobile: normalized,
        dateOfBirth: traveller.dateOfBirth,
        address: traveller.address,
        pinCode: traveller.pinCode,
        state: traveller.state,
        city: traveller.city,
        role: "traveller",
      });
    }

    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );

    const booking = await Booking.create({
      userId: user._id,
      propertyId,
      checkIn,
      checkOut,
      guests,
      totalNights: nights,
      totalAmount: Number(totalAmount),
      bookedBy: ownerId,
      isOffline: true,
      paymentMethod: "razorpay",
      paymentStatus: "initiated"
    });

    return res.json({ success: true, booking });

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

    const traveller = await User.findOne({ mobile: normalized, role: "traveller" });

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
      role: { $in: ["resortOwner", "owner", "propertyOwner", "admin"] }
    });

    if (owner) {
      return res.json({
        success: true,
        exists: true,
        role: owner.role,
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
      paymentStatus: "paid",
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
