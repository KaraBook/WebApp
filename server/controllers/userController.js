import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeMobile } from "../utils/phone.js";

const issueTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "6h" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
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
  dateOfBirth: u.dateOfBirth,
  address: u.address,
  pinCode: u.pinCode,
  avatarUrl: u.avatarUrl,
  createdAt: u.createdAt,
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
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new Error();

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "6h" }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch {
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
      return res.status(404).json({ message: "User not found. Please sign up first." });
    }

    // 🚫 Block resortOwner/admin
    if (user.role === "resortOwner") {
      return res.status(403).json({
        message: "This number belongs to a Resort Owner account. Please log in through the Owner Portal.",
      });
    }
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admins cannot log in via traveller portal.",
      });
    }

    // ✅ Only traveller can pass
    if (user.role !== "traveller") {
      return res.status(403).json({
        message: "Access restricted. Traveller login allowed only for traveller accounts.",
      });
    }

    const { accessToken, refreshToken } = issueTokens(user);
    return res.status(200).json({
      message: "Traveller login successful",
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


export const travellerPrecheck = async (req, res) => {
  const { mobile } = req.body;
  const normalized = normalizeMobile(mobile);

  if (!normalized || normalized.length !== 10) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }

  const user = await User.findOne({ mobile: normalized });

  if (user && user.role !== "traveller") {
    return res.status(403).json({
      message:
        user.role === "resortOwner"
          ? "This number belongs to a Resort Owner account"
          : "This number is not allowed for traveller login",
    });
  }

  return res.status(200).json({ allowOtp: true });
};



export const travellerSignup = async (req, res) => {
  try {
    let mobile = null;

    if (req.firebaseUser?.phone_number) {
      mobile = normalizeMobile(req.firebaseUser.phone_number);
    }

    if (!mobile && req.body.mobile) {
      mobile = normalizeMobile(req.body.mobile);
    }

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Valid mobile number required" });
    }
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Invalid phone token" });
    }

    const existingAnyRole = await User.findOne({ mobile }).select("role");
    if (existingAnyRole && existingAnyRole.role !== "traveller") {
      return res.status(403).json({
        message:
          existingAnyRole.role === "resortOwner"
            ? "This number belongs to a Resort Owner account"
            : "This number is not allowed for traveller signup",
      });
    }

    const {
      firstName,
      lastName,
      email,
      state,
      city,
      dateOfBirth,
      address,
      pinCode,
    } = req.body ?? {};

    if (
      !firstName ||
      !lastName ||
      !email ||
      !state ||
      !city ||
      !address ||
      !pinCode ||
      !dateOfBirth
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (existingAnyRole) {
      return res.status(409).json({
        message: "User already exists. Please login.",
      });
    }

    const existsEmail = await User.findOne({
      email: email.toLowerCase(),
    }).select("_id");

    if (existsEmail) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const user = await User.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      state,
      city,
      mobile,
      role: "traveller",
      dateOfBirth: new Date(dateOfBirth),
      address,
      pinCode,
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

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(err.errors)[0].message,
      });
    }
    if (err?.code === 11000) {
      const field = Object.keys(err?.keyPattern ?? {})[0] || "field";
      return res.status(409).json({ message: `${field} already exists` });
    }

    return res.status(500).json({
      message: "Signup failed",
      error: err.message,
    });
  }
};


export const uploadTravellerAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const file = req.file;
    if (!file?.path) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const BASE_URL = process.env.BACKEND_BASE_URL || "";

    user.avatarUrl = `${BASE_URL}/${file.path.replace(/\\/g, "/")}`;
    await user.save();

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error("Upload avatar error:", err);
    return res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
};



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


export const updateTravellerProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const {
    firstName,
    lastName,
    email,
    dateOfBirth,
    address,
    city,
    state,
    pinCode
  } = req.body;

  user.firstName = firstName;
  user.lastName = lastName;
  user.name = `${firstName} ${lastName}`;
  user.email = email;
  user.dateOfBirth = dateOfBirth;
  user.address = address;
  user.city = city;
  user.state = state;
  user.pinCode = pinCode;

  await user.save();

  res.json({ user });
};



export const resortOwnerLogin = async (req, res) => {
  try {
    const { firebaseUser } = req;
    const mobile = normalizeMobile(firebaseUser?.phone_number);

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Invalid phone verification token" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({
        message:
          "No account found for this mobile number. Please contact our support team to register your property.",
      });
    }

    if (user.role === "traveller") {
      return res.status(403).json({
        message:
          "This mobile number is registered as a Traveller account. Please log in through the Traveller Portal instead.",
      });
    }

    if (!["admin", "resortOwner", "manager"].includes(user.role)) {
      return res.status(403).json({
        message:
          "Access denied. Only verified Resort Owners, Managers or Admins can use this portal.",
      });
    }

    const { accessToken, refreshToken } = issueTokens(user);
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Resort Owner login error:", err);
    return res.status(500).json({
      message: "Something went wrong while logging in. Please try again later.",
      error: err.message,
    });
  }
};


export const updateOwnerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!["resortOwner", "manager", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      address,
      city,
      state,
      pinCode,
    } = req.body;

    user.firstName = firstName;
    user.lastName = lastName;
    user.name = `${firstName} ${lastName}`.trim();
    user.email = email?.toLowerCase();
    user.dateOfBirth = dateOfBirth || null;
    user.address = address;
    user.city = city;
    user.state = state;
    user.pinCode = pinCode;

    await user.validate();
    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: publicUser(user),
    });

  } catch (err) {
    console.error("Owner profile update error:", err);

    if (err.name === "ValidationError") {
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ errors });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(409).json({
        errors: { [field]: `${field} already exists` },
      });
    }

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};


export const uploadOwnerAvatar = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!req.file?.path) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const BASE_URL = process.env.BACKEND_BASE_URL || "";
  user.avatarUrl = `${BASE_URL}/${req.file.path.replace(/\\/g, "/")}`;
  await user.save();

  res.json({ avatarUrl: user.avatarUrl });
};


export const removeOwnerAvatar = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.avatarUrl = "";
  await user.save();

  res.json({ avatarUrl: "" });
};



export const checkResortOwnerNumber = async (req, res) => {
  try {
    const { mobile } = req.body;
    const normalized = normalizeMobile(mobile);

    if (!normalized || normalized.length !== 10) {
      return res.status(400).json({ message: "Please enter a valid 10-digit mobile number." });
    }

    const user = await User.findOne({ mobile: normalized });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found for this number. Please contact admin to register your property.",
      });
    }

    if (user.role === "traveller") {
      return res.status(403).json({
        success: false,
        message:
          "This number belongs to a Traveller account. Please log in via the Traveller Portal.",
      });
    }

    if (!["resortOwner", "admin", "manager"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Owners, Managers or Admins can log in here.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mobile verified. You can proceed with OTP verification.",
    });
  } catch (err) {
    console.error("checkResortOwnerNumber error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while checking number. Please try again later.",
    });
  }
};



export const me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: publicUser(user), roleNotice: `Logged in as ${user.role}` });
};


export const managerPrecheck = async (req, res) => {
  const { mobile } = req.body;
  const user = await User.findOne({ mobile, role: "manager" });
  if (!user) return res.status(404).json({ message: "Manager not found" });
  res.json({ success: true });
};


export const managerLogin = async (req, res) => {
  const firebaseUser = req.user;
  const mobile = firebaseUser.phone_number.replace("+91", "");

  const user = await User.findOne({ mobile, role: "manager" });
  if (!user)
    return res.status(401).json({ message: "Not authorized as manager" });

  const { accessToken, refreshToken } = issueTokens(user);

  res.json({
    accessToken,
    refreshToken,
    user: publicUser(user),
  });

  res.json(tokens);
};



export const removeTravellerAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.avatarUrl) {
      return res.status(400).json({ message: "No avatar to remove" });
    }

    try {
      const filePath = user.avatarUrl.split("/").slice(-2).join("/"); // uploads/avatar.png
      const fullPath = path.join(process.cwd(), filePath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn("Avatar file delete failed:", err.message);
    }
    user.avatarUrl = "";
    await user.save();

    return res.status(200).json({
      message: "Avatar removed successfully",
      avatarUrl: "",
    });
  } catch (err) {
    console.error("Remove avatar error:", err);
    return res.status(500).json({ message: "Failed to remove avatar" });
  }
};



export const travellerCheckGoogle = async (req, res) => {
  const email = req.firebaseUser?.email;
  if (!email) return res.status(400).json({ message: "No email" });

  const exists = !!(await User.findOne({ email }));
  return res.json({ exists });
};

export const travellerLoginGoogle = async (req, res) => {
  const email = req.firebaseUser?.email;
  if (!email) return res.status(400).json({ message: "No email" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Not registered" });

  if (user.role === "resortOwner") {
    return res.status(403).json({
      message: "This account belongs to a Resort Owner. Please log in through the Owner Portal."
    });
  }

  if (user.role === "admin") {
    return res.status(403).json({
      message: "This account belongs to an Admin. Please log in through the Admin Portal."
    });
  }

  if (user.role !== "traveller") {
    return res.status(403).json({
      message: "This account is not allowed on the Traveller portal."
    });
  }

  const tokens = issueTokens(user);
  return res.json({
    ...tokens,
    user: publicUser(user),
  });
};