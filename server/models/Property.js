import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  propertyName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    match: /^[a-zA-Z0-9 ]+$/,
  },

  resortOwner: {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      match: /^[a-zA-Z ]+$/,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      match: /^[a-zA-Z ]+$/,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      unique: true,
    },
    resortEmail: {
      type: String,
      required: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    mobile: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
      unique: true,
    },
    resortMobile: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
    },
  },

  // NEW: link to User
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  propertyType: { type: String, enum: ["villa", "tent", "cottage", "hotel"], required: true },
  description: { type: String, required: true, minlength: 30, maxlength: 500 },
  addressLine1: { type: String, required: true, unique: true },
  addressLine2: { type: String },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pinCode: { type: String, required: true },
  locationLink: { type: String, required: true, unique: true },
  totalRooms: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  roomTypes: { type: [String], default: [] },
  pricingPerNightWeekdays: { type: Number, required: true },
  pricingPerNightWeekend: { type: Number, required: true },
  extraGuestCharge: { type: Number },
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String, required: true },
  minStayNights: { type: Number, required: true },
  foodAvailability:{ type: [String], default: [] },
  amenities: { type: [String], default: [] },
  pan: { type:String, required: true, unique: true },
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

  coverImage: { type:String, required: true },
  shopAct: { type:String, required: true },
  galleryPhotos: { type: [String], required: true },
}, { timestamps: true });




propertySchema.index({ isBlocked: 1 });
export default mongoose.model("Property", propertySchema);
