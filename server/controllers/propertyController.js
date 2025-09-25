import Property from "../models/Property.js";
import User from "../models/User.js";
import cloudinary, { prepareImage, uploadBuffer } from "../utils/cloudinary.js";;
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import { normalizeMobile } from "../utils/phone.js";
import { sendMail } from "../utils/mailer.js";
import { propertyCreatedTemplate } from "../utils/emailTemplates.js";
import get from "lodash.get";

function parseResortOwner(body) {
  if (body.resortOwner) {
    try {
      const v = typeof body.resortOwner === "string" ? JSON.parse(body.resortOwner) : body.resortOwner;
      if (v && typeof v === "object" && (v.email || v.mobile)) {
        return {
          firstName: (v.firstName ?? "").trim(),
          lastName: (v.lastName ?? "").trim(),
          email: (v.email ?? "").trim(),
          resortEmail: (v.resortEmail ?? "").trim(),
          mobile: (v.mobile ?? "").trim(),
          resortMobile: (v.resortMobile ?? "").trim(),
        };
      }
    } catch (_) { }
  }

  const first = (...keys) => {
    for (const k of keys) {
      const val = body[k];
      if (val !== undefined && val !== null && String(val).trim() !== "") return String(val).trim();
    }
    return "";
  };

  return {
    firstName: first("resortOwner[firstName]", "resortOwner.firstName", "resortOwnerFirstName"),
    lastName: first("resortOwner[lastName]", "resortOwner.lastName", "resortOwnerLastName"),
    email: first("resortOwner[email]", "resortOwner.email", "resortOwnerEmail", "ownerEmail"),
    resortEmail: first("resortOwner[resortEmail]", "resortOwner.resortEmail", "resortOwnerResortEmail", "resortEmail"),
    mobile: first("resortOwner[mobile]", "resortOwner.mobile", "resortOwnerMobile", "mobile"),
    resortMobile: first("resortOwner[resortMobile]", "resortOwner.resortMobile", "resortOwnerResortMobile", "resortMobile"),
  };
}
const genTempPassword = () => crypto.randomBytes(7).toString("base64url");




export const checkDuplicateFields = async (raw) => {
  const fields = Object.fromEntries(
    Object.entries(raw).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  );
  if (!Object.keys(fields).length) return null;
  const orConditions = Object.entries(fields).map(([k, v]) => ({ [k]: v }));
  const duplicate = await Property.findOne({ $or: orConditions }).lean();
  if (!duplicate) return null;
  const duplicateField = Object.keys(fields).find((k) => get(duplicate, k) === fields[k]);
  return duplicateField || null;
};


// controllers/propertyController.js
export const createPropertyDraft = async (req, res) => {
  try {
    const owner = parseResortOwner(req.body);
    owner.mobile = normalizeMobile(owner.mobile);
    owner.resortMobile = normalizeMobile(owner.resortMobile);

    if (!owner?.email) {
      return res.status(400).json({ success: false, message: "Resort owner email is required" });
    }
    if (!owner?.mobile || owner.mobile.length !== 10) {
      return res.status(400).json({ success: false, message: "Resort owner mobile is required (10 digits)" });
    }

    const duplicateField = await checkDuplicateFields({
      "resortOwner.email": owner.email,
      "resortOwner.mobile": owner.mobile,
      addressLine1: req.body.addressLine1,
      pan: (req.body.pan || "").toUpperCase(),
      locationLink: req.body.locationLink,
      gstin: (req.body.gstin || "").toUpperCase(),
    });
    if (duplicateField) {
      return res.status(409).json({ success: false, message: `${duplicateField} already exists` });
    }

    const session = await mongoose.startSession();
    let propertyDoc, tempPassword = null, createdNewUser = false;

    await session.withTransaction(async () => {
      let user = await User.findOne({
        $or: [{ email: owner.email.toLowerCase() }, { mobile: owner.mobile }],
      }).select("+password").session(session);

      if (!user) {
        createdNewUser = true;
        tempPassword = genTempPassword();
        const hash = await bcrypt.hash(tempPassword, 10);
        user = (await User.create([{
          name: `${owner.firstName} ${owner.lastName}`.trim(),
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email.toLowerCase(),
          mobile: owner.mobile,
          role: "resortOwner",
          password: hash,
        }], { session }))[0];
      } else {
        user.name = `${owner.firstName} ${owner.lastName}`.trim() || user.name;
        user.firstName = owner.firstName || user.firstName;
        user.lastName  = owner.lastName  || user.lastName;
        user.mobile = owner.mobile || user.mobile;
        if (user.role !== "admin") user.role = "resortOwner";
        if (!user.password) {
          tempPassword = genTempPassword();
          user.password = await bcrypt.hash(tempPassword, 10);
        }
        await user.save({ session });
      }

      // ✅ Create DRAFT (no media yet)
      propertyDoc = new Property({
        ...req.body,
        resortOwner: owner,
        ownerUserId: user._id,
        isDraft: true,
        coverImage: undefined,
        shopAct: undefined,
        galleryPhotos: undefined,
      });

      await propertyDoc.save({ session });

      if (!user.ownedProperties?.some((id) => String(id) === String(propertyDoc._id))) {
        user.ownedProperties.push(propertyDoc._id);
        await user.save({ session });
      }
    });

    return res.status(201).json({
      success: true,
      message: "Draft created",
      data: { _id: propertyDoc._id, isDraft: propertyDoc.isDraft },
      owner: {
        _id: propertyDoc.ownerUserId,
        email: owner.email.toLowerCase(),
        createdNewUser,
        ...(tempPassword ? { tempPassword } : {}),
      },
    });
  } catch (err) {
    console.error("Create draft error:", err);
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate value" });
    }
    return res.status(500).json({ success: false, message: "Failed to create draft" });
  }
};




export const attachPropertyMediaAndFinalize = async (req, res) => {
  try {
    const { id } = req.params;

    const prop = await Property.findById(id).populate("ownerUserId", "email firstName");
    if (!prop) return res.status(404).json({ success: false, message: "Property not found" });
    if (prop.isBlocked) return res.status(403).json({ success: false, message: "Blocked property cannot be edited." });

    const coverFile   = req.files?.coverImage?.[0];
    const shopActFile = req.files?.shopAct?.[0];
    const gallery     = req.files?.galleryPhotos || [];
    const isImage = (m) => /^image\//.test(m || "");

    // ✅ Cover
    if (coverFile) {
      const coverBuf = await prepareImage(coverFile.buffer);
      const coverResult = await uploadBuffer(coverBuf, { folder: "properties", resourceType: "image" });
      prop.coverImage = coverResult.secure_url;
    } else if (!prop.coverImage) {
      return res.status(400).json({ success: false, message: "coverImage is required" });
    }

    // ✅ Shop Act (optional)
    if (shopActFile) {
      let shopActResult;
      if (isImage(shopActFile.mimetype)) {
        const shopActBuf = await prepareImage(shopActFile.buffer);
        shopActResult = await uploadBuffer(shopActBuf, {
          folder: "properties/shopAct",
          resourceType: "image",
        });
      } else {
        shopActResult = await uploadBuffer(shopActFile.buffer, {
          folder: "properties/shopAct",
          resourceType: "raw",
        });
      }
      prop.shopAct = shopActResult.secure_url;
    }

    // ✅ Gallery
    if (gallery.length > 0) {
      const galleryResults = await Promise.all(
        gallery.map(async (f) => {
          const b = await prepareImage(f.buffer);
          return uploadBuffer(b, { folder: "properties/gallery", resourceType: "image" });
        })
      );
      const newUrls = galleryResults.map((r) => r.secure_url);
      prop.galleryPhotos = [...(prop.galleryPhotos || []), ...newUrls];
    }

    // ✅ Publish flag
    if (typeof req.body.publishNow !== "undefined") {
      prop.publishNow = ["true", "1", "yes", "on"].includes(String(req.body.publishNow).toLowerCase());
    }

    // 🔴 Important: mark draft as finalized
    prop.isDraft = false;
    prop.status = "published";

    await prop.save();

    // ✅ Send confirmation email to resort owner
    try {
      const mailData = propertyCreatedTemplate({
        ownerFirstName: prop.resortOwner?.firstName,
        propertyName: prop.propertyName,
        createdNewUser: false, // here it’s always finalizing, not creating new owner
        tempPassword: null,    // only relevant at draft creation
        portalUrl: `${process.env.PORTAL_URL}/owner/properties/${prop._id}`,
      });

      if (prop.resortOwner?.email) {
        await sendMail({
          to: prop.resortOwner.email,
          subject: mailData.subject,
          text: mailData.text,
          html: mailData.html,
        });
        console.log(`📩 Property finalized email sent to ${prop.resortOwner.email}`);
      }
    } catch (mailErr) {
      console.error("Failed to send property created mail:", mailErr);
    }

    return res.status(200).json({ success: true, message: "Media attached & published", data: prop });
  } catch (err) {
    console.error("Finalize error:", err);
    if (err?.http_code === 400 && /Missing required parameter - file/i.test(err.message)) {
      return res.status(400).json({ success: false, message: "Upload failed: missing file content" });
    }
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "Image too large. Max 5MB per file." });
    }
    return res.status(500).json({ success: false, message: "Failed to finalize property" });
  }
};






// controllers/propertyController.js
export const getAllProperties = async (req, res) => {
  try {
    const { isDraft, approvalStatus, featured, blocked, published } = req.query;
    const filter = {};

    if (typeof isDraft !== "undefined") filter.isDraft = isDraft === "true";
    if (typeof featured !== "undefined") filter.featured = featured === "true";
    if (typeof blocked !== "undefined") filter.isBlocked = blocked === "true";
    if (typeof published !== "undefined") filter.publishNow = published === "true";
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ success: false, message: "Failed to fetch properties" });
  }
};


export const getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("Error fetching single property:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};




// -------- UPDATE --------
export const updateProperty = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const propertyId = req.params.id;
    const existingProperty = await Property.findById(propertyId);
    if (!existingProperty)
      return res.status(404).json({ success: false, message: "Property not found" });

    if (existingProperty.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Blocked property cannot be edited.",
      });
    }

    const updatedData = {};
    const files = req.files || {};

    // --- 🟢 If JSON only (raw) ---
    if (req.is("application/json")) {
      Object.assign(updatedData, req.body);

      // Parse resort owner if passed
      const incomingOwner = parseResortOwner(req.body);
      if (incomingOwner?.email) updatedData.resortOwner = incomingOwner;
    }

    // --- 🟢 If multipart (frontend form-data) ---
    if (req.is("multipart/form-data")) {
      Object.assign(updatedData, req.body);

      // resort owner parsing
      const incomingOwner = parseResortOwner(req.body);
      if (incomingOwner?.mobile) incomingOwner.mobile = normalizeMobile(incomingOwner.mobile);
      if (incomingOwner?.resortMobile)
        incomingOwner.resortMobile = normalizeMobile(incomingOwner.resortMobile);
      if (incomingOwner?.email) updatedData.resortOwner = incomingOwner;

      // handle files
      const coverImageFile = files.coverImage?.[0];
      const shopActFile = files.shopAct?.[0];
      const galleryFiles = files.galleryPhotos || [];

      if (coverImageFile) {
        const processed = await prepareImage(coverImageFile.buffer);
        const result = await uploadBuffer(processed, { folder: "properties" });
        updatedData.coverImage = result.secure_url;
      }

      if (shopActFile) {
        const processed = await prepareImage(shopActFile.buffer);
        const result = await uploadBuffer(processed, { folder: "properties/shopAct" });
        updatedData.shopAct = result.secure_url;
      }

      if (galleryFiles.length > 0) {
        const galleryResults = await Promise.all(
          galleryFiles.map(async (f) => {
            const processed = await prepareImage(f.buffer);
            return uploadBuffer(processed, { folder: "properties/gallery" });
          })
        );
        updatedData.galleryPhotos = galleryResults.map((r) => r.secure_url);
      }
    }

    // --- Validation: cover required, at least 3 gallery ---
    const effectiveCover = updatedData.coverImage || existingProperty.coverImage;
    const effectiveGallery =
      updatedData.galleryPhotos || existingProperty.galleryPhotos || [];

    if (!effectiveCover) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required.",
      });
    }
    if (!Array.isArray(effectiveGallery) || effectiveGallery.length < 3) {
      return res.status(400).json({
        success: false,
        message: "At least 3 gallery photos are required.",
      });
    }

    // --- Transaction: update property + link owner user ---
    let updatedProperty;
    await session.withTransaction(async () => {
      if (updatedData.resortOwner?.email && updatedData.resortOwner?.mobile) {
        const incomingOwner = updatedData.resortOwner;

        if (incomingOwner.mobile.length === 10) {
          let user = existingProperty.ownerUserId
            ? await User.findById(existingProperty.ownerUserId)
                .select("+password")
                .session(session)
            : await User.findOne({
                $or: [
                  { email: incomingOwner.email.toLowerCase() },
                  { mobile: incomingOwner.mobile },
                ],
              })
                .select("+password")
                .session(session);

          if (!user) {
            const hash = await bcrypt.hash(genTempPassword(), 10);
            user = await User.create(
              [
                {
                  name: `${incomingOwner.firstName} ${incomingOwner.lastName}`.trim(),
                  firstName: incomingOwner.firstName,
                  lastName: incomingOwner.lastName,
                  email: incomingOwner.email.toLowerCase(),
                  mobile: incomingOwner.mobile,
                  role: "resortOwner",
                  password: hash,
                },
              ],
              { session }
            );
            user = user[0];
          } else {
            user.name = `${incomingOwner.firstName} ${incomingOwner.lastName}`.trim() || user.name;
            user.firstName = incomingOwner.firstName || user.firstName;
            user.lastName = incomingOwner.lastName || user.lastName;
            if (incomingOwner.mobile) user.mobile = incomingOwner.mobile;
            if (incomingOwner.email && incomingOwner.email.toLowerCase() !== user.email) {
              const exists = await User.findOne({
                email: incomingOwner.email.toLowerCase(),
                _id: { $ne: user._id },
              }).session(session);
              if (!exists) user.email = incomingOwner.email.toLowerCase();
            }
            if (user.role !== "admin") user.role = "resortOwner";
            await user.save({ session });
          }
          updatedData.ownerUserId = user._id;
        }
      }

      updatedProperty = await Property.findByIdAndUpdate(
        propertyId,
        { $set: updatedData },
        { new: true, runValidators: true, session }
      );

      if (updatedData.ownerUserId) {
        const owner = await User.findById(updatedData.ownerUserId).session(session);
        if (
          owner &&
          !owner.ownedProperties?.some((id) => String(id) === String(updatedProperty._id))
        ) {
          owner.ownedProperties.push(updatedProperty._id);
          await owner.save({ session });
        }
      }
    });

    res.status(200).json({ success: true, data: updatedProperty });
  } catch (err) {
    console.error("Update Error:", err);
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email or mobile already exists for another user." });
    }
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  } finally {
    session.endSession();
  }
};



export const blockProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id || null; // if you attach admin auth, otherwise keep null

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    if (property.isBlocked) {
      return res.status(400).json({ success: false, message: "Property already blocked" });
    }

    property.isBlocked = true;
    property.publishNow = false;            // make sure it disappears from public views
    property.blocked = { by: adminId, reason: reason?.trim() || "", at: new Date() };

    await property.save();
    res.json({ success: true, data: property });
  } catch (err) {
    console.error("Block property error:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// UNBLOCK
export const unblockProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    if (!property.isBlocked) {
      return res.status(400).json({ success: false, message: "Property is not blocked" });
    }

    property.isBlocked = false;
    property.blocked = undefined; // or: property.blocked = { by:null, reason:"", at:null }
    await property.save();

    res.json({ success: true, data: property });
  } catch (err) {
    console.error("Unblock property error:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};
