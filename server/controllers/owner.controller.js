import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import User from "../models/User.js";

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

