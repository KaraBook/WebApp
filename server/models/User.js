import mongoose from "mongoose";

const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,49}$/;
const mobileRegex = /^[6-9]\d{9}$/;
const emailRegex = /^\w+([.+-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/;
const pinRegex = /^[1-9][0-9]{5}$/;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    firstName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: [nameRegex, "Invalid first name"],
    },

    lastName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: [nameRegex, "Invalid last name"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [emailRegex, "Invalid email"],
      index: true,
    },

    mobile: {
      type: String,
      required: function () {
        const roles = this.roles || [];
        return (
          roles.includes("traveller") ||
          roles.includes("resortOwner") ||
          roles.includes("manager")
        );
      },
      unique: true,
      sparse: true,
      match: [mobileRegex, "Invalid mobile number"],
      index: true,
    },

    roles: {
      type: [String],
      enum: ["admin", "property_admin", "traveller", "resortOwner", "manager"],
      default: ["traveller"],
      index: true,
    },

    primaryRole: {
      type: String,
      enum: ["admin", "property_admin", "traveller", "resortOwner", "manager"],
      default: "traveller",
    },

    state: { type: String, trim: true },
    city: { type: String, trim: true },

    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) return true;

          const today = new Date();
          if (v > today) return false;

          const age = today.getFullYear() - v.getFullYear();
          return age >= 18 && age <= 100;
        },
        message: "Invalid date of birth (must be 18–100 years old)",
      },
    },

    address: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 200,
    },

    pinCode: {
      type: String,
      match: [pinRegex, "Invalid pin code"],
    },

    accountStatus: {
      type: String,
      enum: ["active", "invited", "blocked"],
      default: "active",
      index: true,
    },

    mobileVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    avatarUrl: { type: String, default: "" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    password: {
      type: String,
      minlength: 6,
      select: false,
    },

    ownedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);