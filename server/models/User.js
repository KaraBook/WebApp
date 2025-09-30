import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/^\w+([\.+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, "Please enter a valid email"],
  },
  password: { type: String, minlength: 6, select: false, default: null },
  role: { type: String, enum: ['admin', 'traveller', 'resortOwner'], default: 'traveller' },
  mobile: { type: String, required: true, unique: true, match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"] },

  firstName: { type: String, trim: true },
  lastName:  { type: String, trim: true },

  state: {
    type: String, trim: true,
    required: function () { return this.role === 'traveller'; }
  },
  city: {
    type: String, trim: true,
    required: function () { return this.role === 'traveller'; }
  },

  avatarUrl: { type: String, default: "" },
  ownedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
}, { timestamps: true });

export default mongoose.model("User", userSchema);
