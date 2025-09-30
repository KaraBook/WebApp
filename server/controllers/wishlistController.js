import Wishlist from "../models/Wishlist.js";

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, properties: [] });
    }

    if (wishlist.properties.includes(propertyId)) {
      wishlist.properties = wishlist.properties.filter(
        (id) => id.toString() !== propertyId
      );
      await wishlist.save();
      return res.json({ success: true, message: "Removed from wishlist", data: wishlist });
    } else {
      wishlist.properties.push(propertyId);
      await wishlist.save();
      return res.json({ success: true, message: "Added to wishlist", data: wishlist });
    }
  } catch (err) {
    console.error("Wishlist error:", err);
    res.status(500).json({ success: false, message: "Failed to update wishlist" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.findOne({ userId }).populate("properties");
    res.json({ success: true, data: wishlist?.properties || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};
