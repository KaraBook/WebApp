import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeMobile } from "../utils/phone.js";
import fs from "fs";
import path from "path";

const issueTokens = (user, activeRole) => {
  const roles = Array.isArray(user.roles)
    ? user.roles
    : (user.role ? [user.role] : []);
  const accessToken = jwt.sign(
    {
      id: user._id,
      roles,
      activeRole,
    },
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
  roles: u.roles,
  primaryRole: u.primaryRole,
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

    const roles = user.roles || [];
    const activeRole =
      roles.includes("admin") ? "admin" :
        roles.includes("property_admin") ? "property_admin" :
          roles.includes("manager") ? "manager" :
            roles.includes("resortOwner") ? "resortOwner" :
              "traveller";

    const { accessToken, refreshToken } = issueTokens(user, activeRole);

    return res.json({
      data: {
        accessToken,
        refreshToken,
        activeRole,
        roles,
        user: publicUser(user),
      },
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

    const user = await User.findById(decoded.id).select("roles primaryRole");
    if (!user) throw new Error();

    const roles = user.roles || [];
    const activeRole =
      roles.includes("admin") ? "admin" :
        roles.includes("property_admin") ? "property_admin" :
          roles.includes("manager") ? "manager" :
            roles.includes("resortOwner") ? "resortOwner" :
              "traveller";

    const newAccessToken = jwt.sign(
      { id: user._id, roles, activeRole },
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
        activeRole,
        roles,
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
    const user = await User.findOne({ mobile: normalized.trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up first." });
    }
    const roles = user.roles || [];
    if (roles.includes("admin") && !roles.includes("traveller")) {
      return res.status(403).json({
        message: "Admins cannot log in via traveller portal.",
      });
    }
    if (!roles.includes("traveller")) {
      return res.status(403).json({
        message: "This account is not enabled for Traveller portal.",
      });
    }
    const tokens = issueTokens(user, "traveller");
    return res.status(200).json({
      message: "Traveller login successful",
      ...tokens,
      activeRole: "traveller",
      roles,
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
  const exists = !!(
    await User.findOne({ mobile: mobile.trim() }).select("_id")
  );
  return res.status(200).json({ exists, mobile });
};


export const travellerPrecheck = async (req, res) => {
  const { mobile } = req.body;
  const normalized = normalizeMobile(mobile);

  if (!normalized || normalized.length !== 10) {
    return res.status(400).json({ message: "Invalid mobile number" });
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
    const emailLower = email.toLowerCase().trim();
    let user = await User.findOne({
      $or: [{ mobile: mobile.trim() }, { email: emailLower }],
    });
    if (user) {
      user.roles = Array.from(new Set([...(user.roles || []), "traveller"]));
      user.firstName = firstName;
      user.lastName = lastName;
      user.name = `${firstName} ${lastName}`.trim();
      user.email = emailLower;
      user.state = state;
      user.city = city;
      user.dateOfBirth = new Date(dateOfBirth);
      user.address = address;
      user.pinCode = pinCode;
      user.mobile = mobile.trim();

      await user.save();

      const tokens = issueTokens(user, "traveller");
      return res.status(200).json({
        message: "Traveller profile enabled successfully",
        ...tokens,
        user: publicUser(user),
      });
    }
    user = await User.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email: emailLower,
      state,
      city,
      mobile: mobile.trim(),
      roles: ["traveller"],
      primaryRole: "traveller",
      dateOfBirth: new Date(dateOfBirth),
      address,
      pinCode,
    });
    const tokens = issueTokens(user, "traveller");
    return res.status(201).json({
      message: "Signup successful",
      ...tokens,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Traveller signup error:", err);
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
    const roles = user.roles || [];
    if (!roles.includes("traveller")) {
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
    const user = await User.findOne({ mobile: mobile.trim() });
    if (!user) {
      return res.status(404).json({
        message:
          "No account found for this mobile number. Please contact support to register your property.",
      });
    }
    const roles = user.roles || [];
    if (!roles.some((r) => ["admin", "resortOwner", "manager"].includes(r))) {
      return res.status(403).json({
        message: "Access denied. Only Owners/Managers/Admins can use this portal.",
      });
    }
    const activeRole = roles.includes("manager") ? "manager" : (roles.includes("resortOwner") ? "resortOwner" : "admin");
    const tokens = issueTokens(user, activeRole);
    return res.status(200).json({
      message: "Login successful",
      ...tokens,
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



export const resortOwnerPasswordLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Username/email and password are required",
      });
    }
    const email = identifier.toLowerCase().trim();
    const user = await User.findOne({ email }).select("+password roles");

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const roles = user.roles || [];
    if (!roles.some((r) => ["resortOwner", "manager", "admin"].includes(r))) {
      return res.status(403).json({
        message: "Access denied. Only owners/managers/admins allowed.",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const activeRole =
      roles.includes("manager") ? "manager" :
        roles.includes("resortOwner") ? "resortOwner" :
          "admin";

    const tokens = issueTokens(user, activeRole);
    return res.json({ ...tokens, activeRole, roles, user: publicUser(user) });
  } catch (err) {
    console.error("Owner password login error:", err);
    return res.status(500).json({
      message: "Login failed. Try again later.",
    });
  }
};



export const updateOwnerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const roles = user.roles || [];
    if (!roles.some((r) => ["resortOwner", "manager", "admin"].includes(r))) {
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



export const updateOwnerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user || !user.password) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error("Password update error:", err);

    return res.status(500).json({
      message: "Failed to update password",
    });
  }
};



export const updateOwnerMobile = async (req, res) => {
  try {
    const userId = req.user.id;
    const newMobile = normalizeMobile(req.firebaseUser?.phone_number);

    if (!newMobile || newMobile.length !== 10) {
      return res.status(400).json({ message: "Invalid phone token" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const roles = user.roles || [];
    if (!roles.some((r) => ["resortOwner", "manager", "admin"].includes(r))) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (user.mobile === newMobile) {
      return res.status(400).json({
        message: "New mobile is same as current",
      });
    }

    const exists = await User.findOne({
      mobile: newMobile.trim(),
      _id: { $ne: userId },
    }).select("roles");

    if (exists) {
      const eroles = exists.roles || [];
      let message = "This mobile number is already in use.";

      if (eroles.includes("traveller")) message = "This number belongs to a Traveller account. Please use a different number.";
      else if (eroles.includes("resortOwner")) message = "This number belongs to another Resort Owner account.";
      else if (eroles.includes("manager")) message = "This number belongs to a Manager account.";
      else if (eroles.includes("admin")) message = "This number belongs to an Admin account.";

      return res.status(409).json({ message });
    }


    user.mobile = newMobile;
    await user.save();

    res.status(200).json({
      message: "Mobile updated",
      mobile: newMobile,
    });

  } catch (err) {
    console.error("Owner mobile update error:", err);
    res.status(500).json({
      message: "Update failed",
      error: err.message,
    });
  }
};

export const checkMobileAvailability = async (req, res) => {
  try {
    const { mobile } = req.body;
    const normalized = normalizeMobile(mobile);

    if (!normalized || normalized.length !== 10) {
      return res.status(400).json({
        message: "Invalid mobile number",
      });
    }

    const exists = await User.findOne({
      mobile: normalized.trim(),
    }).select("roles");

    if (exists) {
      const eroles = exists.roles || [];
      let message = "This mobile number is already in use.";

      if (eroles.includes("traveller")) message = "This number belongs to a Traveller account.";
      else if (eroles.includes("resortOwner")) message = "This number belongs to another Resort Owner account.";
      else if (eroles.includes("manager")) message = "This number belongs to a Manager account.";
      else if (eroles.includes("admin")) message = "This number belongs to an Admin account.";

      return res.status(409).json({ message });
    }

    return res.json({
      success: true,
      message: "Mobile number available",
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to check number",
    });
  }
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

    const user = await User.findOne({
      mobile: normalized.trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found for this number. Please contact admin to register your property.",
      });
    }

    const roles = user.roles || [];

    if (roles.includes("traveller") && !roles.some(r => ["resortOwner", "manager", "admin"].includes(r))) {
      return res.status(403).json({
        success: false,
        message: "This number belongs to a Traveller-only account. Please use Traveller Portal.",
      });
    }

    if (!roles.some((r) => ["resortOwner", "admin", "manager"].includes(r))) {
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
  return res.json({
    user: publicUser(user),
    roles: req.user.roles || user.roles || [],
    activeRole: req.user.activeRole || user.primaryRole || null,
  });
};


export const managerPrecheck = async (req, res) => {
  const { mobile } = req.body;
  const user = await User.findOne({ mobile, roles: "manager" });
  if (!user) return res.status(404).json({ message: "Manager not found" });
  res.json({ success: true });
};


export const managerLogin = async (req, res) => {
  const firebaseUser = req.firebaseUser;
  const mobile = normalizeMobile(firebaseUser?.phone_number);
  if (!mobile) {
    return res.status(400).json({ message: "Invalid phone token" });
  }
  const user = await User.findOne({
    mobile: mobile.trim(),
    roles: "manager",
  });
  if (!user) {
    return res.status(401).json({ message: "Not authorized as manager" });
  }
  const tokens = issueTokens(user, "manager");
  return res.json({
    ...tokens,
    activeRole: "manager",
    roles: user.roles || [],
    user: publicUser(user),
  });
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

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(404).json({ message: "Not registered" });

  if (!user.roles.includes("traveller")) {
    user.roles.push("traveller");
    await user.save();
  }
  const tokens = issueTokens(user, "traveller");
  return res.json({
    ...tokens,
    activeRole: "traveller",
    roles: user.roles,
    user: publicUser(user),
  });
};