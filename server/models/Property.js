// models/Property.js
import mongoose from "mongoose";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const propertySchema = new mongoose.Schema({
  // NEW
  isDraft: { type: Boolean, default: true, index: true },

  propertyName: { type: String, required: true, minlength: 3, maxlength: 100, match: /^[a-zA-Z0-9 ]+$/ },

  resortOwner: {
    firstName: { type: String, required: true, minlength: 2, maxlength: 50, match: /^[a-zA-Z ]+$/ },
    lastName:  { type: String, required: true, minlength: 2, maxlength: 50, match: /^[a-zA-Z ]+$/ },
    email:     { type: String, required: true, lowercase: true, match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/, unique: true },
    resortEmail:{ type: String, required: true, lowercase: true, match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/ },
    mobile:    { type: String, required: true, match: /^[6-9]\d{9}$/, unique: true },
    resortMobile:{ type: String, required: true, match: /^[6-9]\d{9}$/ },
  },

  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  propertyType: { type: String, enum: ["villa", "tent", "cottage", "hotel"], required: true },
  description:  { type: String, required: true, minlength: 30, maxlength: 500 },
  addressLine1: { type: String, required: true, unique: true },
  addressLine2: { type: String },
  state:        { type: String, required: true },
  city:         { type: String, required: true },
  pinCode:      { type: String, required: true },
  locationLink: { type: String, required: true, unique: true },
  totalRooms:   { type: Number, required: true },
  maxGuests:    { type: Number, required: true },
  roomTypes:    { type: [String], default: [] },
  pricingPerNightWeekdays: { type: Number, required: true },
  pricingPerNightWeekend:  { type: Number, required: true },
  extraGuestCharge:        { type: Number },

  checkInTime:   { type: String, required: true },
  checkOutTime:  { type: String, required: true },
  minStayNights: { type: Number, required: true },

  foodAvailability: { type: [String], default: [] },
  amenities:       { type: [String], default: [] },

  pan:   { type: String, required: true, unique: true },
  gstin: { type: String, required: true, uppercase: true, trim: true, match: [GSTIN_REGEX, "Invalid GSTIN format"] },

  kycVerified:   { type: Boolean, required: true },
  publishNow:    { type: Boolean },
  featured:      { type: Boolean, default: false },
  approvalStatus:{ type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

  isBlocked: { type: Boolean, default: false },
  blocked: {
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, maxlength: 300 },
    at: { type: Date }
  },
  internalNotes: String,

  // ✅ Conditionally required when !isDraft
  coverImage: {
    type: String,
    required: [function () { return !this.isDraft; }, "Cover image is required"],
  },
  shopAct: {
    type: String,
    required: [function () { return !this.isDraft; }, "Shop Act is required"],
  },
  galleryPhotos: {
    type: [String],
    required: [function () { return !this.isDraft; }, "At least one gallery photo is required"],
    validate: {
      validator: function (arr) { return this.isDraft || (Array.isArray(arr) && arr.length > 0); },
      message: "At least one gallery photo is required",
    },
  },

}, { timestamps: true });

propertySchema.index({ isDraft: 1 });

export default mongoose.model("Property", propertySchema);
