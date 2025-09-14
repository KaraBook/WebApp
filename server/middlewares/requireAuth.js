import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = { id: user._id, role: user.role, isAdmin: user.role === "admin" };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};
