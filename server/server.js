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

dotenv.config();
const app = express();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigin = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://karabookfrontend.netlify.app",
  "http://88.222.244.26/admin",
  "http://88.222.244.26",
  "https://karabookdev.cloud",
  "https://karabookdev.cloud/admin",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigin.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => res.send("API is up"));

app.use("/api/auth", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api", locationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
