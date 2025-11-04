import Booking from "../models/Booking.js";
import Property from "../models/Property.js";

export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const properties = await Property.find({ ownerUserId: ownerId });
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
        .reduce((sum, b) => sum + b.totalAmount, 0),
    };

    res.json({ success: true, data: { stats, properties, bookings } });
  } catch (err) {
    console.error("getOwnerDashboard error:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard" });
  }
};

export const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ ownerUserId: req.user.id });
    res.json({ success: true, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load properties" });
  }
};

export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const propertyIds = (
      await Property.find({ ownerUserId: ownerId }).select("_id")
    ).map((p) => p._id);

    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate("propertyId", "propertyName")
      .populate("userId", "firstName lastName mobile");

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
};
