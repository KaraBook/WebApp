import Joi from "joi";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PROPERTY_NAME_REGEX = /^(?!^\d+$)(?!^\s)[a-zA-Z0-9\s@#&.,]+$/;

const baseFields = {
  propertyName: Joi.string()
    .trim()
    .min(10)
    .max(100)
    .pattern(/^(?!\d+$)[A-Za-z0-9 @#&.,]+$/)
    .required()
    .messages({
      "string.pattern.base": "Property name must be 10+ chars, not only digits, and can include @ # & . ,"
    }),

  resortOwner: Joi.object({
    firstName: Joi.string().min(2).max(50).pattern(/^[\p{L}\s.'-]+$/u).required()
      .messages({
        "string.pattern.base": "First name must contain only letters, spaces, and allowed special characters (.'-)"
      }),
    lastName: Joi.string().min(2).max(50).pattern(/^[\p{L}\s.'-]+$/u).required()
      .messages({
        "string.pattern.base": "Last name must contain only letters, spaces, and allowed special characters (.'-)"
      }),
    email: Joi.string().email().required(),
    resortEmail: Joi.string().email().required(),
    mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    resortMobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  }).required(),
  propertyType: Joi.string().valid("villa", "tent", "cottage", "hotel").required(),
  description: Joi.string().min(30).max(500).required(),
  addressLine1: Joi.string()
    .trim()
    .min(5)
    .max(100)
    .pattern(/^(?!\d+$)[A-Za-z0-9\s,.\-#/&]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Address Line 1 can include letters, numbers, spaces, and , . - # / &, but cannot be only digits or contain special symbols"
    }),
  area: Joi.string().min(1).max(50).required()
    .messages({
      "string.empty": "Area is required"
    }),
  addressLine2: Joi.string().max(100).allow(""),
  state: Joi.string()
  .pattern(/^(?:[A-Z]{2}|[\p{L}]+(?:\s[\p{L}]+)*)$/u)
  .required()
  .messages({
    "string.pattern.base":
      "State must be a valid 2-letter code (MH) or full name (Maharashtra)"
  }),
  city: Joi.string()
    .pattern(/^[\p{L}]+(?:[\s][\p{L}]+)*$/u)
    .required()
    .messages({
      "string.pattern.base": "City must contain only letters and spaces (no leading/trailing whitespace)"
    }),
  pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  locationLink: Joi.string().uri().required(),
  roomBreakdown: Joi.object({
    ac: Joi.number().min(0).max(999).default(0),
    nonAc: Joi.number().min(0).max(999).default(0),
    deluxe: Joi.number().min(0).max(999).default(0),
    luxury: Joi.number().min(0).max(999).default(0),
    total: Joi.number().min(0).max(999).default(0),
  }).required(),
  maxGuests: Joi.number().min(1).max(999).required(),
  petFriendly: Joi.boolean().required(),
  pricingPerNightWeekdays: Joi.number().min(10).max(999999).required(),
  pricingPerNightWeekend: Joi.number().min(10).max(999999).required(),
  extraGuestCharge: Joi.number().min(0).max(9999).optional(),
  checkInTime: Joi.string().required(),
  checkOutTime: Joi.string().required(),
  minStayNights: Joi.number().min(1).max(999).required(),
  foodAvailability: Joi.array().items(Joi.string()),
  amenities: Joi.array().items(Joi.string().trim().min(1).max(50)).default([]),
  pan: Joi.string().length(10).required(),
  gstin: Joi.string().length(15).pattern(GSTIN_REGEX).required()
    .messages({
      "string.empty": "GSTIN is required",
      "string.length": "GSTIN must be exactly 15 characters",
      "string.pattern.base": "GSTIN format is invalid",
    }),
  kycVerified: Joi.boolean().required(),
  publishNow: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
  approvalStatus: Joi.string().valid("pending", "approved", "rejected").optional(),
  internalNotes: Joi.string().max(500).allow(""),
};

const draftSchema = Joi.object({
  ...baseFields,
});

const updateSchema = Joi.object({
  ...baseFields,
  coverImage: Joi.string().uri().optional(),
  shopAct: Joi.string().uri().optional(),
  galleryPhotos: Joi.array().items(Joi.string().uri()).optional(),
});

function parseResortOwnerFromBody(body) {
  if (body.resortOwner) {
    try { return typeof body.resortOwner === "string" ? JSON.parse(body.resortOwner) : body.resortOwner; }
    catch { /* fallthrough */ }
  }
  const first = (...keys) => {
    for (const k of keys) {
      const v = body[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
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

function normalizeArraysAndTypes(body) {
  const normalizeArray = (key) => {
    if (body[`${key}[]`]) {
      body[key] = Array.isArray(body[`${key}[]`]) ? body[`${key}[]`] : [body[`${key}[]`]];
      delete body[`${key}[]`];
    } else if (!Array.isArray(body[key]) && body[key] != null) {
      body[key] = [body[key]];
    }
  };
  ["roomTypes", "foodAvailability", "amenities"].forEach(normalizeArray);

  [
    "totalRooms", "maxGuests", "pricingPerNightWeekdays", "pricingPerNightWeekend", "extraGuestCharge", "minStayNights",
  ].forEach((n) => {
    if (body[n] !== undefined && body[n] !== "") body[n] = Number(body[n]);
  });

  ["kycVerified", "publishNow", "featured"].forEach((b) => {
    if (body[b] === "true") body[b] = true;
    if (body[b] === "false") body[b] = false;
  });
}

export const validatePropertyDraft = (req, res, next) => {
  const payload = { ...req.body };

  if (payload.roomBreakdown && typeof payload.roomBreakdown === "string") {
    try {
      payload.roomBreakdown = JSON.parse(payload.roomBreakdown);
    } catch {
      payload.roomBreakdown = {};
    }
  }

  payload.resortOwner = parseResortOwnerFromBody(payload);
  normalizeArraysAndTypes(payload);

  const { error } = draftSchema.validate(payload, { allowUnknown: true, stripUnknown: true });
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  next();
};



export const validatePropertyUpdate = (req, res, next) => {
  const payload = { ...req.body };

  if (payload.roomBreakdown && typeof payload.roomBreakdown === "string") {
    try {
      payload.roomBreakdown = JSON.parse(payload.roomBreakdown);
    } catch {
      payload.roomBreakdown = {};
    }
  }

  payload.resortOwner = parseResortOwnerFromBody(payload);
  normalizeArraysAndTypes(payload);

  const { error } = updateSchema.validate(payload, { allowUnknown: true, stripUnknown: true });
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  next();
};


export const ensureMediaFilesPresent = (req, res, next) => {
  const cover = req.files?.coverImage?.[0];
  const shop = req.files?.shopAct?.[0];
  const gal = req.files?.galleryPhotos || [];
  if (!cover || !shop || gal.length === 0) {
    return res.status(400).json({ success: false, message: "coverImage, shopAct and galleryPhotos are required" });
  }
  next();
};
