import { getUniqueLocations } from "../controllers/locationController";

const router = express.Router();


router.get("/location/unique", getUniqueLocations);


export default router;