import express from "express";
import {
  login,
  refreshToken,
  travellerLogin,
  travellerSignup,
  resortOwnerLogin,
  updateTravellerMobile,
  travellerCheck,
  me,
  uploadTravellerAvatar,
} from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh-token", refreshToken);

router.post("/traveller/login", verifyFirebaseToken, travellerLogin);
router.post("/traveller/check", verifyFirebaseToken, travellerCheck);
router.post("/traveller/signup", verifyFirebaseToken, travellerSignup);
router.post(
  "/traveller/upload-avatar",
  requireAuth,
  upload.single("image"),
  uploadTravellerAvatar
);


router.put("/traveller/mobile", requireAuth, verifyFirebaseToken, updateTravellerMobile);
router.post("/resort-owner/login", verifyFirebaseToken, resortOwnerLogin);

router.get("/me", requireAuth, me);

export default router;
