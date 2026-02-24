import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { normalizeMobile } from "../utils/phone.js";
import { sendMail } from "../utils/mailer.js";
import { managerAccountCreatedTemplate } from "../utils/emailTemplates.js";

const nameRegex = /^[a-zA-Z][a-zA-Z\s'.-]{1,49}$/;

export const createManager = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const { firstName, lastName, name, email, mobile, password } = req.body;

    const plainPassword = password;

    if (!email || !mobile || !password || (!name && (!firstName || !lastName))) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, mobile and password are required",
      });
    }

    const emailLower = String(email).toLowerCase().trim();

    const fullName = String(
      name || `${String(firstName || "").trim()} ${String(lastName || "").trim()}`
    ).trim();

    if (!fullName || fullName.length < 2 || !nameRegex.test(fullName)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name",
      });
    }

    const normalized = normalizeMobile(mobile);
    if (!normalized || normalized.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existsMobile = await User.findOne({ mobile: normalized }).select("_id roles");
    if (existsMobile) {
      return res.status(409).json({ success: false, message: "Mobile already exists" });
    }

    const existsEmail = await User.findOne({ email: emailLower }).select("_id");
    if (existsEmail) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const manager = await User.create({
      name: fullName,
      firstName: firstName?.trim() || fullName.split(" ")[0] || "",
      lastName: lastName?.trim() || fullName.split(" ").slice(1).join(" ") || "",
      email: emailLower,
      mobile: normalized,

      roles: ["manager"],
      primaryRole: "manager",

      createdBy: ownerId,

      password: hashed,
    });

    try {
      const emailTemplate = managerAccountCreatedTemplate({
        managerName: manager.name,
        managerEmail: manager.email,
        managerPassword: plainPassword,
      });

      await sendMail({
        to: manager.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (mailErr) {
      console.error("Manager email failed:", mailErr);
    }

    return res.status(201).json({
      success: true,
      message: "Manager created successfully",
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        mobile: manager.mobile,
        roles: manager.roles,
        primaryRole: manager.primaryRole,
        createdBy: manager.createdBy,
      },
    });
  } catch (err) {
    console.error("Create Manager Error:", err);

    if (err?.code === 11000) {
      const field = Object.keys(err?.keyPattern ?? {})[0] || "field";
      return res.status(409).json({ success: false, message: `${field} already exists` });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};