import Joi from "joi";
import Property from "../models/Property";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const baseFields = {
  propertyName: Joi.string()
    .trim()
    .min(10)
    .max(100)
    .pattern(/^(?!\d+$)[A-Za-z0-9 @#&.,]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Property name must be 10+ chars, not only digits, and can include @ # & . ,",
    }),

  resortOwner: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[\p{L}\s.'-]+$/u)
      .required()
      .messages({
        "string.pattern.base":
          "First name must contain only letters, spaces, and allowed special characters (.'-)",
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[\p{L}\s.'-]+$/u)
      .required()
      .messages({
        "string.pattern.base":
          "Last name must contain only letters, spaces, and allowed special characters (.'-)",
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
        "Address Line 1 can include letters, numbers, spaces, and , . - # / &, but cannot be only digits",
    }),

  area: Joi.string().min(1).max(50).required(),

  addressLine2: Joi.string().max(100).allow(""),

  state: Joi.string()
    .pattern(/^(?:[A-Z]{2}|[\p{L}]+(?:\s[\p{L}]+)*)$/u)
    .required(),

  city: Joi.string()
    .pattern(/^[\p{L}]+(?:[\s][\p{L}]+)*$/u)
    .required(),

  pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).required(),

  locationLink: Joi.string().uri().required(),

  roomBreakdown: Joi.object({
    ac: Joi.number().min(0).max(999).default(0),
    nonAc: Joi.number().min(0).max(999).default(0),
    deluxe: Joi.number().min(0).max(999).default(0),
    luxury: Joi.number().min(0).max(999).default(0),
    hall: Joi.number().min(0).max(999).default(0),
    total: Joi.number().min(0).max(999).default(0),
  }).required(),

  bedrooms: Joi.number()
    .min(0)
    .max(100)
    .required()
    .messages({
      "number.base": "Bedrooms must be a number",
      "any.required": "Bedrooms is required",
    }),

  bathrooms: Joi.number()
    .min(0)
    .max(100)
    .required()
    .messages({
      "number.base": "Bathrooms must be a number",
      "any.required": "Bathrooms is required",
    }),

  maxGuests: Joi.number().min(1).max(999).required(),

  baseGuests: Joi.number()
    .min(1)
    .max(50)
    .required()
    .messages({
      "number.base": "Base guests must be a number",
      "any.required": "Base guests is required",
    }),

  pricingPerNightWeekdays: Joi.number().min(10).max(999999).required(),
  pricingPerNightWeekend: Joi.number().min(10).max(999999).required(),

  isRefundable: Joi.boolean().required(),

  refundNotes: Joi.string()
    .max(500)
    .allow("")
    .optional(),

  extraAdultCharge: Joi.number()
    .min(0)
    .max(99999)
    .required(),

  extraChildCharge: Joi.number()
    .min(0)
    .max(99999)
    .required(),

  extraGuestCharge: Joi.number().min(0).max(9999).optional(),

  petFriendly: Joi.boolean().required(),

  checkInTime: Joi.string().required(),
  checkOutTime: Joi.string().required(),

  minStayNights: Joi.number().min(1).max(999).required(),

  foodAvailability: Joi.array().items(Joi.string()),
  amenities: Joi.array().items(Joi.string().trim().min(1).max(50)).default([]),

  pan: Joi.string().length(10).optional().allow("")
    .messages({
      "string.length": "PAN must be exactly 10 characters",
    }),

  gstin: Joi.string().length(15).pattern(GSTIN_REGEX).optional().allow("")
    .messages({
      "string.pattern.base": "GSTIN format is invalid",
    }),

  kycVerified: Joi.boolean().required(),

  publishNow: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),

  approvalStatus: Joi.string()
    .valid("pending", "approved", "rejected")
    .optional(),

  internalNotes: Joi.string().max(500).allow(""),
};

/* ---------- SCHEMAS WITH BUSINESS RULE ---------- */

const draftSchema = Joi.object(baseFields).custom((value, helpers) => {
  if (value.baseGuests > value.maxGuests) {
    return helpers.message("Base guests cannot be greater than max guests");
  }
  if (value.isRefundable === true && !value.refundNotes?.trim()) {
    return helpers.message("Refund notes are required when property is refundable");
  }

  if (value.isRefundable === false && value.refundNotes) {
    value.refundNotes = "";
  }
  if (value.isRefundable === true && (!value.cancellationPolicy || !value.cancellationPolicy.length)) {
    return helpers.message("Cancellation policy is required for refundable property");
  }
  return value;
});

const updateSchema = Joi.object({
  ...baseFields,
  cancellationPolicy: Joi.when("isRefundable", {
    is: true,
    then: Joi.array()
      .min(1)
      .items(
        Joi.object({
          minDaysBefore: Joi.number().min(0).required(),
          refundPercent: Joi.number().min(0).max(100).required(),
        })
      )
      .required(),
    otherwise: Joi.array()
      .items(
        Joi.object({
          minDaysBefore: Joi.number().min(0).required(),
          refundPercent: Joi.number().min(0).max(100).required(),
        })
      )
      .default([{ minDaysBefore: 0, refundPercent: 0 }]),
  }),
  coverImage: Joi.string().uri().optional(),
  shopAct: Joi.string().uri().optional(),
  galleryPhotos: Joi.array().items(Joi.string().uri()).optional(),
}).custom((value, helpers) => {
  if (value.baseGuests > value.maxGuests) {
    return helpers.message("Base guests cannot be greater than max guests");
  }
  if (value.isRefundable === true && !value.refundNotes?.trim()) {
    return helpers.message("Refund notes are required when property is refundable");
  }

  if (value.isRefundable === false && value.refundNotes) {
    value.refundNotes = "";
  }
  return value;
});

/* ---------- HELPERS ---------- */

function parseResortOwnerFromBody(body) {
  if (body.resortOwner) {
    try {
      return typeof body.resortOwner === "string"
        ? JSON.parse(body.resortOwner)
        : body.resortOwner;
    } catch { }
  }

  const first = (...keys) => {
    for (const k of keys) {
      if (body[k]) return String(body[k]).trim();
    }
    return "";
  };

  return {
    firstName: first("resortOwner[firstName]", "resortOwner.firstName"),
    lastName: first("resortOwner[lastName]", "resortOwner.lastName"),
    email: first("resortOwner[email]", "resortOwner.email"),
    resortEmail: first("resortOwner[resortEmail]", "resortOwner.resortEmail"),
    mobile: first("resortOwner[mobile]", "resortOwner.mobile"),
    resortMobile: first("resortOwner[resortMobile]", "resortOwner.resortMobile"),
  };
}

function normalizeArraysAndTypes(body) {
  ["foodAvailability", "amenities"].forEach((key) => {
    if (body[`${key}[]`]) {
      body[key] = Array.isArray(body[`${key}[]`])
        ? body[`${key}[]`]
        : [body[`${key}[]`]];
      delete body[`${key}[]`];
    }
  });

  [
    "totalRooms",
    "maxGuests",
    "baseGuests",
    "pricingPerNightWeekdays",
    "pricingPerNightWeekend",
    "extraAdultCharge",
    "extraChildCharge",
    "extraGuestCharge",
    "minStayNights",
    "bedrooms",
    "bathrooms",
  ].forEach((n) => {
    if (body[n] !== undefined && body[n] !== "") {
      body[n] = Number(body[n]);
    }
  });

  ["kycVerified", "publishNow", "featured", "isRefundable"].forEach((b) => {
    if (body[b] === "true") body[b] = true;
    if (body[b] === "false") body[b] = false;
  });
}

/* ---------- MIDDLEWARES ---------- */

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

  const { error } = draftSchema.validate(payload, {
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  next();
};

export const validatePropertyUpdate = (req, res, next) => {
  const payload = { ...req.body };

  if (payload.roomBreakdown && typeof payload.roomBreakdown === "string") {
    payload.roomBreakdown = JSON.parse(payload.roomBreakdown);
  }

  if (payload.cancellationPolicy && typeof payload.cancellationPolicy === "string") {
    payload.cancellationPolicy = JSON.parse(payload.cancellationPolicy);
  }

  payload.resortOwner = parseResortOwnerFromBody(payload);
  normalizeArraysAndTypes(payload);

  const { error } = updateSchema.validate(payload, {
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  next();
};

export const ensureMediaFilesPresent = async (req, res, next) => {
  const propertyId = req.params.id;

  if (!propertyId) return next(); // create flow only

  const property = await Property.findById(propertyId).select("galleryPhotos coverImage");

  const cover =
    req.files?.coverImage?.[0] || property?.coverImage;

  const galleryCount =
    (req.files?.galleryPhotos?.length || 0) +
    (property?.galleryPhotos?.length || 0);

  if (!cover) {
    return res.status(400).json({
      success: false,
      message: "Cover image is required",
    });
  }

  if (galleryCount < 3) {
    return res.status(400).json({
      success: false,
      message: "At least 3 gallery photos are required",
    });
  }

  next();
};


export const ownerUpdateSchema = Joi.object({
  description: Joi.string().min(30).max(500).optional(),

  pricingPerNightWeekdays: Joi.number().min(10).optional(),
  pricingPerNightWeekend: Joi.number().min(10).optional(),
  extraAdultCharge: Joi.number().min(0).optional(),
  extraChildCharge: Joi.number().min(0).optional(),

  minStayNights: Joi.number().min(1).optional(),

  maxGuests: Joi.number().min(1).optional(),
  baseGuests: Joi.number().min(1).optional(),

  roomBreakdown: Joi.object({
    ac: Joi.number().min(0),
    nonAc: Joi.number().min(0),
    deluxe: Joi.number().min(0),
    luxury: Joi.number().min(0),
    hall: Joi.number().min(0),
  }).optional(),

  bedrooms: Joi.number().min(0).optional(),
  bathrooms: Joi.number().min(0).optional(),

  foodAvailability: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),

  petFriendly: Joi.boolean().optional(),

  isRefundable: Joi.boolean().optional(),
  refundNotes: Joi.string().allow("").optional(),

  cancellationPolicy: Joi.when("isRefundable", {
    is: true,
    then: Joi.array().min(1).required(),
    otherwise: Joi.array().optional(),
  }),

  coverImage: Joi.string().uri().optional(),
  shopAct: Joi.string().uri().optional(),
  galleryPhotos: Joi.array().items(Joi.string().uri()).optional(),
}).custom((value, helpers) => {
  if (
    value.baseGuests !== undefined &&
    value.maxGuests !== undefined &&
    value.baseGuests > value.maxGuests
  ) {
    return helpers.message("Base guests cannot be greater than max guests");
  }

  if (value.isRefundable === true && !value.refundNotes?.trim()) {
    return helpers.message("Refund notes are required when property is refundable");
  }

  if (value.isRefundable === false) {
    value.refundNotes = "";
  }

  return value;
});



export const validateOwnerPropertyUpdate = (req, res, next) => {
  const payload = { ...req.body };

  if (payload.roomBreakdown && typeof payload.roomBreakdown === "string") {
    payload.roomBreakdown = JSON.parse(payload.roomBreakdown);
  }

  if (payload.cancellationPolicy && typeof payload.cancellationPolicy === "string") {
    payload.cancellationPolicy = JSON.parse(payload.cancellationPolicy);
  }

  normalizeArraysAndTypes(payload);

  const { error } = ownerUpdateSchema.validate(payload, {
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};