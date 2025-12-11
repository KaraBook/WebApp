import User from "../models/User.js";
import { normalizeMobile } from "../utils/phone.js";

export const createManager = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { name, email, mobile } = req.body;

    if (!name || !email || !mobile) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const normalized = normalizeMobile(mobile);
    if (!normalized || normalized.length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid mobile number" });
    }

    const existsMobile = await User.findOne({ mobile: normalized });
    if (existsMobile) {
      return res.status(409).json({ success: false, message: "Mobile already exists" });
    }

    const existsEmail = await User.findOne({ email: email.toLowerCase() });
    if (existsEmail) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const manager = await User.create({
      name,
      email: email.toLowerCase(),
      mobile: normalized,
      role: "manager",
      createdBy: ownerId,
      password: "TEMP_MANAGER" 
    });

    res.json({
      success: true,
      message: "Manager created successfully",
      manager,
    });

  } catch (err) {
    console.error("Create Manager Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
