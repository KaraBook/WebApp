import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoute.js";
import propertyRoutes from "./routes/propertyRoute.js";

dotenv.config();
const app = express();
connectDB();

const allowedOrigin = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175","https://karabookfrontend.netlify.app"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigin.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => res.send("API is up"));

app.use("/api/auth", userRoutes);
app.use("/api/properties", propertyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
