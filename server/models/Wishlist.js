import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);
