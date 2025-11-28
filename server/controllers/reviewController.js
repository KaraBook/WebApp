import Review from "../models/Review.js";
import Property from "../models/Property.js";

export const addReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const userId = req.user.id;

    const existing = await Review.findOne({ propertyId, userId });
    if (existing) {
      return res.status(400).json({ message: "You already reviewed this property." });
    }

    const review = await Review.create({ propertyId, userId, rating, comment });

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
      .populate("userId", "name avatarUrl")
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
