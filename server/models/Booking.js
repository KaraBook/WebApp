import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },

    checkIn: Date,
    checkOut: Date,
    guests: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 }
    },
    totalNights: Number,
    totalAmount: Number,
    taxAmount: Number,
    grandTotal: Number,

    contactNumber: String,

    paymentId: String,
    orderId: String,

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cash"],
      default: "razorpay",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "initiated", "paid", "failed"],
      default: "pending",
    },

    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isOffline: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export default mongoose.model("Booking", bookingSchema);
