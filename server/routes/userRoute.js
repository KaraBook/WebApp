import express from "express";
import { login, refreshToken, travellerLogin, travellerSignup } from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";


const router = express.Router();

router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/traveller/login", verifyFirebaseToken, travellerLogin);
router.post("/traveller/signup", verifyFirebaseToken, travellerSignup);

export default router;
