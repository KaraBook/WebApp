import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  totalNights: Number,
  totalAmount: Number,
  paymentId: String,
  orderId: String,
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  contactNumber: String,
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isOffline: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
