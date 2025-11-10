import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prepareImage, uploadBuffer } from "../utils/cloudinary.js";
import { normalizeMobile } from "../utils/phone.js";

const genTempPassword = () => crypto.randomBytes(7).toString("base64url");

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

    if (existingProperty.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Blocked property cannot be edited",
      });
    }

    const updatedData = {};
    const files = req.files || {};

    if (req.is("application/json")) Object.assign(updatedData, req.body);
    if (req.is("multipart/form-data")) Object.assign(updatedData, req.body);

    if (req.body.roomBreakdown) {
      let rb = req.body.roomBreakdown;
      if (typeof rb === "string") {
        try { rb = JSON.parse(rb); } catch (_) {}
      }
      const ac = Number(rb.ac || 0);
      const nonAc = Number(rb.nonAc || 0);
      const deluxe = Number(rb.deluxe || 0);
      const luxury = Number(rb.luxury || 0);
      const total = ac + nonAc + deluxe + luxury;
      updatedData.roomBreakdown = { ac, nonAc, deluxe, luxury, total };
      updatedData.totalRooms = total;
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

