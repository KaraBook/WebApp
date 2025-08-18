import Property from "../models/Property.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs/promises";



// Create a new property
export const createProperty = async (req, res) => {
  try {
    const files = req.files;
    const coverImage = files.coverImage?.[0];
    const galleryPhotos = files.galleryPhotos || [];
    const shopAct = files.shopAct?.[0];

    // Upload images
    const coverResult = coverImage
      ? await cloudinary.uploader.upload(coverImage.path, { folder: "properties" })
      : null;

    const shopActResult = shopAct
      ? await cloudinary.uploader.upload(shopAct.path, { folder: "properties/shopAct" }) 
      : null;

    const galleryResults = await Promise.all(
      galleryPhotos.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "properties/gallery" })
      )
    );

    // Clean up temp files
    const deletePromises = [];
    if (coverImage) deletePromises.push(fs.unlink(coverImage.path));
    if (shopAct) deletePromises.push(fs.unlink(shopAct.path));
    galleryPhotos.forEach((file) => deletePromises.push(fs.unlink(file.path)));
    await Promise.all(deletePromises);

    // Save to DB
    const newProperty = new Property({
      ...req.body,
      coverImage: coverResult?.secure_url || "",
      shopAct: shopActResult?.secure_url || "",
      galleryPhotos: galleryResults.map((img) => img.secure_url),
    });

    await newProperty.save();
    res.status(201).json({ success: true, data: newProperty });

  } catch (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image size too large. Please upload images under 5MB.",
      });
    }

    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// Get all properties
export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 }); // most recent first
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};


// Get single property by ID
export const getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("Error fetching single property:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


// Update property
export const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const existingProperty = await Property.findById(propertyId);
    if (!existingProperty) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const files = req.files || {};
    const coverImage = files.coverImage?.[0];
    const shopAct = files.shopAct?.[0];
    const galleryPhotos = files.galleryPhotos || [];

    let updatedData = { ...req.body };

    // Parse resortOwner if sent as stringified object
    if (typeof req.body.resortOwner === "string") {
      updatedData.resortOwner = JSON.parse(req.body.resortOwner);
    }

    // If new cover image is uploaded
    if (coverImage) {
      const coverResult = await cloudinary.uploader.upload(coverImage.path);
      updatedData.coverImage = coverResult.secure_url;
    }

    // If new shop act is uploaded
    if (shopAct) {
      const shopActResult = await cloudinary.uploader.upload(shopAct.path, { folder: "properties/shopAct" });
      updatedData.shopAct = shopActResult.secure_url;
    }

    // If new gallery images uploaded
    if (galleryPhotos.length > 0) {
      const galleryResults = await Promise.all(
        galleryPhotos.map((file) => cloudinary.uploader.upload(file.path))
      );
      updatedData.galleryPhotos = galleryResults.map((img) => img.secure_url);
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedProperty });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};
