import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name must be under 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
      "Please enter a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false, 
  },
  role: {
    type: String,
    enum: ['admin', 'traveller', 'resortOwner'],
    default: 'traveller',
  },
  mobile: {
  type: String,
  required: true,
  unique: true,
  match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"],
},
firstName: String,
lastName: String,
state: String,
district: String,

}, {
  timestamps: true,
});


const User = mongoose.model("User", userSchema);
export default User;