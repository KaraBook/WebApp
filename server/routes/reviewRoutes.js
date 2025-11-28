import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { addReview, getPropertyReviews, getUserReviews, deleteReview } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", requireAuth, addReview);
router.get("/property/:propertyId", getPropertyReviews);
router.get("/user", requireAuth, getUserReviews);
router.delete("/:reviewId", requireAuth, deleteReview);

export default router;
