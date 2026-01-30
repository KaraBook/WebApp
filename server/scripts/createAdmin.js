import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const admins = [
  {
    name: "Admin",
    email: "admin@resort.com",
    password: "admin123",
    role: "admin"
  },
  {
    name: "Karabook Admin",
    email: "admin@karabook.in",
    password: "KarabookAdmin@123",
    role: "property_admin"
  },
];

const createAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const a of admins) {
      const exists = await User.findOne({ email: a.email });

      if (exists) {
        console.log(`⚠️ Admin already exists: ${a.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(a.password, 10);

      const admin = new User({
        name: a.name,
        email: a.email,
        password: hashedPassword,
        role: a.role,
      });

      await admin.save();
      console.log(`✅ Created admin: ${a.email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admins:", error.message);
    process.exit(1);
  }
};

createAdmins();