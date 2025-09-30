import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeMobile } from "../utils/phone.js";
import { prepareImage, uploadBuffer } from "../utils/cloudinary.js";

const issueTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  return { accessToken, refreshToken };
};

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  mobile: u.mobile,
  role: u.role,
  state: u.state,
  city: u.city,
  avatarUrl: u.avatarUrl,
});

/* ---------------------------- LOGIN --------------------------- */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = issueTokens(user);

    return res.json({
      accessToken,
      refreshToken,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ---------------------------- REFRESH TOKEN --------------------------- */
export const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid refresh token" });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ message: "Token refreshed", data: { accessToken } });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

/* ---------------------------- TRAVELLER LOGIN --------------------------- */
export const travellerLogin = async (req, res) => {
  try {
    const { firebaseUser } = req;
    const normalized = normalizeMobile(firebaseUser?.phone_number);
    if (!normalized || normalized.length !== 10) {
      return res.status(400).json({ message: "Invalid phone token" });
    }

    const user = await User.findOne({ mobile: normalized });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up." });
    }

    if (user.role !== "admin" && user.role !== "resortOwner" && user.role !== "traveller") {
      user.role = "traveller";
      await user.save();
    }

    const { accessToken, refreshToken } = issueTokens(user);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Traveller login error:", err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

/* ---------------------------- TRAVELLER CHECK --------------------------- */
export const travellerCheck = async (req, res) => {
  const mobile = normalizeMobile(req.firebaseUser?.phone_number);
  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({ message: "Invalid phone token" });
  }
  const exists = !!(await User.findOne({ mobile }).select("_id"));
  return res.status(200).json({ exists, mobile });
};


export const travellerSignup = async (req, res) => {
  try {
    const mobile = normalizeMobile(req.firebaseUser?.phone_number);
    if (!mobile || mobile.length !== 10)
      return res.status(400).json({ message: "Invalid phone token" });

    const { firstName, lastName, email, state, city } = req.body ?? {};
    if (!firstName || !lastName || !email || !state || !city) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existsMobile = await User.findOne({ mobile });
    if (existsMobile)
      return res.status(409).json({ message: "User already exists. Please login." });

    const existsEmail = await User.findOne({ email: email.toLowerCase() });
    if (existsEmail)
      return res.status(409).json({ message: "Email already in use." });

    const user = await User.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      state,
      city,
      mobile,
      role: "traveller",
    });

    const { accessToken, refreshToken } = issueTokens(user);
    return res.status(201).json({
      message: "Signup successful",
      accessToken,
      refreshToken,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Traveller signup error:", err);
    if (err?.code === 11000) {
      const field = Object.keys(err?.keyPattern ?? {})[0] || "field";
      return res.status(409).json({ message: `${field} already exists` });
    }
    return res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// Upload Avatar separately
export const uploadTravellerAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const file = req.file;
    if (!file?.buffer) return res.status(400).json({ message: "No file uploaded" });

    const processed = await prepareImage(file.buffer);
    const cloud = await uploadBuffer(processed, { folder: "users/avatars" });

    user.avatarUrl = cloud.secure_url;
    await user.save();

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error("Upload avatar error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
};


/* ---------------------------- UPDATE MOBILE --------------------------- */
export const updateTravellerMobile = async (req, res) => {
  try {
    const userId = req.user.id;
    const newMobile = normalizeMobile(req.firebaseUser?.phone_number);

    if (!newMobile || newMobile.length !== 10) {
      return res.status(400).json({ message: "Invalid phone token" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "traveller") {
      return res.status(403).json({ message: "Only travellers can update mobile here" });
    }

    if (user.mobile === newMobile) {
      return res.status(400).json({ message: "New mobile is same as current" });
    }

    const exists = await User.findOne({ mobile: newMobile, _id: { $ne: userId } });
    if (exists) {
      return res.status(409).json({ message: "Mobile already in use" });
    }

    user.mobile = newMobile;
    await user.save();

    res.status(200).json({ message: "Mobile updated", mobile: newMobile });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

/* ---------------------------- RESORT OWNER LOGIN --------------------------- */
export const resortOwnerLogin = async (req, res) => {
  try {
    const { firebaseUser } = req;
    const mobile = normalizeMobile(firebaseUser?.phone_number);
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Invalid phone token" });
    }

    let user = await User.findOne({ mobile }).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "Resort owner account not found. Please contact admin.",
      });
    }

    if (user.role !== "admin" && user.role !== "resortOwner") {
      user.role = "resortOwner";
      await user.save();
    }

    const { accessToken, refreshToken } = issueTokens(user);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Resort owner login error:", err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

/* ---------------------------- ME --------------------------- */
export const me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json({ user: publicUser(user) });
};
