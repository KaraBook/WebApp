import express from "express";
import { sendContactEnquiry, sendPropertyLead } from "../controllers/contactController.js";

const router = express.Router();

router.post("/contact", sendContactEnquiry);
router.post("/property-lead", sendPropertyLead);

export default router;