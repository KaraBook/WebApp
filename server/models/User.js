import mongoose from 'mongoose';

const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,49}$/;
const mobileRegex = /^[6-9]\d{9}$/;
const emailRegex = /^\w+([.+-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/;
const pinRegex = /^[1-9][0-9]{5}$/;

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },

  firstName: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50,
    match: [nameRegex, "Invalid first name"]
  },

  lastName: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50,
    match: [nameRegex, "Invalid last name"]
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
    required: true,
    unique: true,
    match: [mobileRegex, "Invalid mobile number"],
    index: true,
  },

  role: {
    type: String,
    enum: ["admin", "traveller", "resortOwner"],
    default: "traveller"
  },

  state: {
    type: String,
    trim: true,
    required: function () { return this.role === "traveller"; }
  },

  city: {
    type: String,
    trim: true,
    required: function () { return this.role === "traveller"; }
  },

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
      message: "Invalid date of birth (must be 18–100 years old)"
    }
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

  avatarUrl: { type: String, default: "" },

   password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  ownedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]

}, { timestamps: true });

export default mongoose.model("User", userSchema);
