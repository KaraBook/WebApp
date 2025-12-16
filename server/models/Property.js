import mongoose from "mongoose";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PROPERTY_NAME_REGEX = /^(?!^\d+$)(?!^\s)[a-zA-Z0-9\s@#&.,]+$/;

const propertySchema = new mongoose.Schema({
  isDraft: { type: Boolean, default: true, index: true },

  propertyName: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100,
    match: [
      /^(?!\d+$)[A-Za-z0-9 @#&.,]+$/,
      "Property name must be 10+ chars, not only digits, and can include @ # & . ,"
    ],
    trim: true,
  },

  resortOwner: {
    firstName: {
      type: String, required: true, minlength: 2, maxlength: 50,
      match: [/^[\p{L}\s.'-]+$/u, "First name must contain only letters, spaces, and allowed special characters (.'-)"]
    },
    lastName: {
      type: String, required: true, minlength: 2, maxlength: 50,
      match: [/^[\p{L}\s.'-]+$/u, "Last name must contain only letters, spaces, and allowed special characters (.'-)"]
    },
    email: { type: String, required: true, lowercase: true, match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/, unique: true },
    resortEmail: { type: String, required: true, lowercase: true, match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/ },
    mobile: { type: String, required: true, match: /^[6-9]\d{9}$/, unique: true },
    resortMobile: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  },

  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  propertyType: { type: String, enum: ["villa", "tent", "cottage", "hotel"], required: true },
  description: { type: String, required: true, minlength: 30, maxlength: 500 },
  addressLine1: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
    trim: true,
    match: [
      /^(?!\d+$)[A-Za-z0-9\s,.\-#/&]+$/,
      "Address Line 1 can include letters, numbers, spaces, and , . - # / &, but cannot be only digits or contain special symbols"
    ]
  },
  area: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine2: { type: String },
  state: {
    type: String,
    required: true,
    match: [
      /^(?:[A-Z]{2}|[\p{L}]+(?:\s[\p{L}]+)*)$/u,
      "State must be a valid 2-letter code (MH) or a full state name (Maharashtra)"
    ]
  },
  city: {
    type: String,
    required: true,
    match: [/^[\p{L}]+(?:[\s][\p{L}]+)*$/u, "City must contain only letters and spaces (no leading/trailing whitespace)"]
  },
  pinCode: { type: String, required: true },
  locationLink: { type: String, required: true, unique: true },
  roomBreakdown: {
    ac: { type: Number, default: 0 },
    nonAc: { type: Number, default: 0 },
    deluxe: { type: Number, default: 0 },
    luxury: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  petFriendly: { type: Boolean, required: true, default: false },
  maxGuests: { type: Number, required: true },
  baseGuests: { type: Number, required: true },
  pricingPerNightWeekdays: { type: Number, required: true },
  pricingPerNightWeekend: { type: Number, required: true },
  extraAdultCharge: { type: Number, required: true },
  extraChildCharge: { type: Number, required: true },
  extraGuestCharge: { type: Number },

  checkInTime: { type: String, required: true },
  checkOutTime: { type: String, required: true },
  minStayNights: { type: Number, required: true },

  foodAvailability: { type: [String], default: [] },
  amenities: { type: [String], default: [] },

  pan: { type: String, required: true, unique: true },
  gstin: { type: String, uppercase: true, trim: true, match: [GSTIN_REGEX, "Invalid GSTIN format"] },

  kycVerified: { type: Boolean, required: true },
  publishNow: { type: Boolean },
  featured: { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

  isBlocked: { type: Boolean, default: false },
  blocked: {
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, maxlength: 300 },
    at: { type: Date }
  },
  internalNotes: String,

  coverImage: {
    type: String,
    required: [function () { return !this.isDraft; }, "Cover image is required"],
  },
  shopAct: {
    type: String,
    required: [function () { return !this.isDraft; }, "Shop Act is required"],
  },
  averageRating: { type: Number, default: 0 },
  galleryPhotos: {
    type: [String],
    required: [function () { return !this.isDraft; }, "At least one gallery photo is required"],
    validate: {
      validator: function (arr) { return this.isDraft || (Array.isArray(arr) && arr.length > 0); },
      message: "At least one gallery photo is required",
    },
  },
  blockedDates: [
    {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      reason: { type: String, default: "" },
      addedByOwner: { type: Boolean, default: true }
    }
  ],


}, { timestamps: true });

propertySchema.index({ isDraft: 1 });

export default mongoose.model("Property", propertySchema);
