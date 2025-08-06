import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email);

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    if (user.role !== "admin") {
      console.log("User role is not admin:", user.role);
      return res.status(401).json({ message: "Unauthorized: Not an admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};




export const refreshToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      message: "Token refreshed",
      data: {
        accessToken,
      },
    });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};


export const travellerLogin = async (req, res) => {
  const { firebaseUser } = req;

  try {
    const user = await User.findOne({ mobile: firebaseUser.phone_number });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up." });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};



// POST /api/traveller/signup
export const travellerSignup = async (req, res) => {
  const { firebaseUser } = req;
  const { name, email, state, district } = req.body;

  try {
    const existing = await User.findOne({ mobile: firebaseUser.phone_number });

    if (existing) {
      return res.status(409).json({ message: "User already exists. Please login." });
    }

    const user = await User.create({
      name,
      email,
      state,
      district,
      mobile: firebaseUser.phone_number,
      role: "traveller",
    });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Signup successful",
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};
