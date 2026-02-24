import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoute.js";
import propertyRoutes from "./routes/propertyRoute.js";
import wishlistRoute from "./routes/wishlistRoute.js";
import bookingRoute from "./routes/bookingRoutes.js";
import reviewRoute from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/admin.js";
import ownerRoutes from "./routes/owner.routes.js";
import locationRoutes from "./routes/locationRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();
const app = express();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  "https://karabookdev.cloud",
  "https://admin.karabookdev.cloud",
  "https://owner.karabookdev.cloud",

  "https://karabook.in",
  "https://admin.karabook.in",
  "https://owner.karabook.in",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const UPLOADS_PATH = path.join(__dirname, "uploads");

app.use(
  "/uploads",
  express.static(UPLOADS_PATH, {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cache-Control", "no-store");
    },
  })
);

console.log("Serving uploads from:", UPLOADS_PATH);

app.get("/", (_req, res) => res.send("API is up"));

app.use("/api/auth", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api", locationRoutes);
app.use("/api", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
