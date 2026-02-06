import express from "express";
import {
  login,
  refreshToken,
  travellerLogin,
  travellerSignup,
  resortOwnerLogin,
  updateTravellerMobile,
  travellerCheck,
  travellerPrecheck,
  me,
  uploadTravellerAvatar,
  checkResortOwnerNumber,
  managerPrecheck,
  managerLogin,
  removeTravellerAvatar,
  updateTravellerProfile,
  updateOwnerProfile,
  uploadOwnerAvatar,
  removeOwnerAvatar,
  travellerCheckGoogle,
  travellerLoginGoogle,
  resortOwnerPasswordLogin,
} from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh-token", refreshToken);

router.post("/traveller/login", verifyFirebaseToken, travellerLogin);
router.post("/traveller/precheck", travellerPrecheck);
router.post("/traveller/check", verifyFirebaseToken, travellerCheck);
router.post("/traveller/signup", verifyFirebaseToken, travellerSignup);
router.put("/traveller/profile", requireAuth, updateTravellerProfile);
router.post(
  "/traveller/upload-avatar",
  requireAuth,
  upload.single("image"),
  uploadTravellerAvatar
);
router.delete(
  "/traveller/avatar",
  requireAuth,
  removeTravellerAvatar
);

router.put("/owner/profile", requireAuth, updateOwnerProfile);

router.post(
  "/owner/avatar",
  requireAuth,
  upload.single("image"),
  uploadOwnerAvatar
);

router.delete(
  "/owner/avatar",
  requireAuth,
  removeOwnerAvatar
);

router.put("/traveller/mobile", requireAuth, verifyFirebaseToken, updateTravellerMobile);
router.post("/resort-owner/precheck", checkResortOwnerNumber);
router.post("/resort-owner/login", verifyFirebaseToken, resortOwnerLogin);
router.post("/resort-owner/password-login", resortOwnerPasswordLogin);

router.post("/manager/precheck", managerPrecheck);
router.post("/manager/login", verifyFirebaseToken, managerLogin);


router.post("/traveller/google/check", verifyFirebaseToken, travellerCheckGoogle);
router.post("/traveller/google/login", verifyFirebaseToken, travellerLoginGoogle);
router.get("/me", requireAuth, me);

export default router;
