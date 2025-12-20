import Review from "../models/Review.js";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";

export const addReview = async (req, res) => {
  try {
    const { propertyId, bookingId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }


    const booking = await Booking.findOne({
      _id: bookingId,
      propertyId: propertyId,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(403).json({
        message: "You cannot review this property because you have not booked it.",
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(403).json({
        message: "You can review this property only after completing the payment.",
      });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        message: "You already submitted a review for this booking.",
      });
    }

    const review = await Review.create({
      propertyId,
      userId,
      bookingId,
      rating,
      comment,
    });

    const allReviews = await Review.find({ propertyId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Property.findByIdAndUpdate(propertyId, { averageRating: avgRating });

    res.status(201).json({ success: true, data: review });

  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ message: "Failed to add review" });
  }
};


export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const reviews = await Review.find({ propertyId })
      .populate("userId", "name firstName lastName email avatarUrl")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};



export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.find({ userId })
      .populate("propertyId", "propertyName coverImage city state")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user reviews" });
  }
};



export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ message: "Review not found or unauthorized" });
    }

    const propertyId = review.propertyId;
    await Review.deleteOne({ _id: reviewId });
    const allReviews = await Review.find({ propertyId });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
        : 0;

    await Property.findByIdAndUpdate(propertyId, { averageRating: avgRating });

    res.json({ success: true, message: "Review removed" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
