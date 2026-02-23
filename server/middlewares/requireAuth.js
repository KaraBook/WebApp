import jwt from "jsonwebtoken";
import User from "../models/User.js";


const genTempPassword = () => crypto.randomBytes(7).toString("base64url");


export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(payload.id).select("roles primaryRole");
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const roles = user.roles || [];
    const activeRole = payload.activeRole; 

    req.user = {
      id: user._id,
      roles,
      primaryRole: user.primaryRole,
      activeRole,
      isAdmin: roles.includes("admin"),
      isPropertyAdmin: roles.includes("property_admin"),
    };

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


export const requirePropertyAdmin = (req, res, next) => {
  const roles = req.user?.roles || [];
  if (!roles.includes("admin") && !roles.includes("property_admin")) {
    return res.status(403).json({ message: "Property admins only" });
  }
  next();
};



