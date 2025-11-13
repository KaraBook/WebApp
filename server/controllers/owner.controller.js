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
    if (!existingProperty)
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this property",
      });

    if (existingProperty.isDraft || !existingProperty.publishNow) {
      return res.status(403).json({
        success: false,
        message: "Draft properties cannot be edited. Contact admin to publish first."
      });
    }

    const updatedData = {};
    const files = req.files || {};

    if (req.is("application/json")) Object.assign(updatedData, req.body);
    if (req.is("multipart/form-data")) Object.assign(updatedData, req.body);

    if (
      req.body.roomBreakdown ||
      req.body["roomBreakdown[ac]"] ||
      req.body["roomBreakdown.nonAc"]
    ) {
      const rb = {
        ac: Number(req.body["roomBreakdown[ac]"] ?? req.body.roomBreakdown?.ac ?? 0),
        nonAc: Number(req.body["roomBreakdown[nonAc]"] ?? req.body.roomBreakdown?.nonAc ?? 0),
        deluxe: Number(req.body["roomBreakdown[deluxe]"] ?? req.body.roomBreakdown?.deluxe ?? 0),
        luxury: Number(req.body["roomBreakdown[luxury]"] ?? req.body.roomBreakdown?.luxury ?? 0),
      };
      rb.total = rb.ac + rb.nonAc + rb.deluxe + rb.luxury;
      updatedData.roomBreakdown = rb;
      updatedData.totalRooms = rb.total;
    }

    const coverImageFile = files.coverImage?.[0];
    const galleryFiles = files.galleryPhotos || [];
    const shopActFile = files.shopAct?.[0];

    if (coverImageFile) {
      const processed = await prepareImage(coverImageFile.buffer);
      const result = await uploadBuffer(processed, { folder: "properties" });
      updatedData.coverImage = result.secure_url;
    }

    if (shopActFile) {
      const processed = await prepareImage(shopActFile.buffer);
      const result = await uploadBuffer(processed, {
        folder: "properties/shopAct",
      });
      updatedData.shopAct = result.secure_url;
    }

    if (galleryFiles.length > 0) {
      const galleryResults = await Promise.all(
        galleryFiles.map(async (f) => {
          const processed = await prepareImage(f.buffer);
          return uploadBuffer(processed, { folder: "properties/gallery" });
        })
      );
      updatedData.galleryPhotos = galleryResults.map((r) => r.secure_url);
    }

    const effectiveCover =
      updatedData.coverImage || existingProperty.coverImage;
    const effectiveGallery =
      updatedData.galleryPhotos || existingProperty.galleryPhotos || [];

    if (!effectiveCover) {
      return res
        .status(400)
        .json({ success: false, message: "Cover image is required" });
    }

    if (!Array.isArray(effectiveGallery) || effectiveGallery.length < 3) {
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

      const owner = await User.findById(ownerId).session(session);
      if (
        owner &&
        !owner.ownedProperties?.some((id) => String(id) === String(propertyId))
      ) {
        owner.ownedProperties.push(propertyId);
        await owner.save({ session });
      }
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
        message: "Duplicate value found (email, mobile, or GSTIN).",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Update failed", error: err.message });
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
    console.log("🟢 addBlockedDates hit");
    console.log("Body received:", req.body);
    console.log("Params received:", req.params);

    const { id } = req.params;
    const { start, end, reason } = req.body;

    console.log("🟢 addBlockedDates hit", { id, start, end, reason });

    if (!start || !end) {
      console.error("❌ Missing start or end date:", req.body);
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



export const createOfflineBooking = async (req, res) => {
  try {
    const { traveller, propertyId, checkIn, checkOut, guests, totalAmount } = req.body;
    const ownerId = req.user.id;

    if (!propertyId || !traveller?.mobile || !totalAmount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const normalized = normalizeMobile(traveller.mobile);
    let user = await User.findOne({ mobile: normalized });

    if (user) {
      let updated = false;

      const updatableFields = ["firstName", "lastName", "email", "state", "city", "dateOfBirth", "address", "pinCode"];

      updatableFields.forEach((field) => {
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


    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Missing Razorpay credentials in environment variables");
      return res.status(500).json({ success: false, message: "Payment configuration error" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(totalAmount) * 100),
      currency: "INR",
      receipt: `OFFLINE_${Date.now()}`,
      notes: { createdByOwner: ownerId },
    });

    const booking = await Booking.create({
      userId: user._id,
      propertyId,
      checkIn,
      checkOut,
      guests,
      totalNights: Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)),
      totalAmount: Number(totalAmount),
      orderId: order.id,
      bookedBy: ownerId,
      paymentStatus: "pending",
      isOffline: true,
    });

    console.log(`✅ Offline booking created for property ${propertyId}`);
    res.json({ success: true, order, booking, traveller: user });
  } catch (err) {
    console.error("🔥 Offline Booking Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Offline booking failed",
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
