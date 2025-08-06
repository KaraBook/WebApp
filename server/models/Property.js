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
  name: { type: String, required: true },
  contact: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/,
  },
},
  propertyType: {
    type: String,
    enum: ["villa", "tent", "cottage", "hotel"],
    required: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 30,
    maxlength: 500,
  },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pinCode: { type: String, required: true },
  locationLink: { type: String, required: true },
  totalRooms: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  roomTypes: { type: [String], default: [] },
  pricingPerNight: { type: Number, required: true },
  extraGuestCharge: { type: Number },
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String, required: true },
  confirmationType: {
    type: String,
    enum: ["auto", "manual"],
    required: true,
  },
  minStayNights: { type: Number, required: true },
  foodAvailability:{ type: [String], default: [] },
  amenities: { type: [String], default: [] },
  nearbyAttractions: String,
  gstin: String,
  pan: String,
  kycVerified: { type: Boolean, required: true },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  publishNow: { type: Boolean, required: true },
  internalNotes: String,
  coverImage: String,
  galleryPhotos: [String],
}, { timestamps: true });

export default mongoose.model("Property", propertySchema);
