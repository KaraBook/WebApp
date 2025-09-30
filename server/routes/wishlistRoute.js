import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { toggleWishlist, getWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/toggle", requireAuth, toggleWishlist);
router.get("/", requireAuth, getWishlist);

export default router;
