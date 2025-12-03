import { getUniqueLocations } from "../controllers/locationController.js";
import express from "express";

const router = express.Router();


router.get("/location/unique", getUniqueLocations);


export default router;