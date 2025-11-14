import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },

    checkIn: Date,
    checkOut: Date,
    guests: Number,
    totalNights: Number,
    totalAmount: Number,

    // Online fields
    paymentId: String,
    orderId: String,

    // Offline fields
    paymentMethod: {
      type: String,
      enum: ["online", "cash", "upi"],
      default: "online",
    },

    offlineTransactionId: String,
    offlineReceiptImage: String,

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
