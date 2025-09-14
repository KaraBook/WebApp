import Joi from "joi";

const baseFields = {
  propertyName: Joi.string().min(3).max(100).regex(/^[a-zA-Z0-9 ]+$/).required(),
  resortOwner: Joi.object({
    firstName: Joi.string().min(2).max(50).regex(/^[a-zA-Z ]+$/).required(),
    lastName:  Joi.string().min(2).max(50).regex(/^[a-zA-Z ]+$/).required(),
    email: Joi.string().email().required(),
    resortEmail: Joi.string().email().required(),
    mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    resortMobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  }).required(),
  propertyType: Joi.string().valid("villa", "tent", "cottage", "hotel").required(),
  description: Joi.string().min(30).max(500).required(),
  addressLine1: Joi.string().min(5).max(100).required(),
  addressLine2: Joi.string().max(100).allow(""),
  state: Joi.string().required(),
  city: Joi.string().required(),
  pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  locationLink: Joi.string().uri().required(),
  totalRooms: Joi.number().min(1).max(999).required(),
  maxGuests: Joi.number().min(1).max(999).required(),
  roomTypes: Joi.array().items(Joi.string()),
  pricingPerNightWeekdays: Joi.number().min(10).max(999999).required(),
  pricingPerNightWeekend: Joi.number().min(10).max(999999).required(),
  extraGuestCharge: Joi.number().min(0).max(9999).optional(),
  checkInTime: Joi.string().required(),
  checkOutTime: Joi.string().required(),
  minStayNights: Joi.number().min(1).max(999).required(),
  foodAvailability: Joi.array().items(Joi.string()),
  amenities: Joi.array().items(Joi.string()),
  pan: Joi.string().length(10).required(),
  kycVerified: Joi.boolean().required(),
  publishNow: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
  approvalStatus: Joi.string().valid("pending", "approved", "rejected").optional(),
  internalNotes: Joi.string().max(500).allow(""),
};

const createSchema = Joi.object({
  ...baseFields,
  coverImage: Joi.string().uri().required(),
  shopAct: Joi.string().uri().required(),
  galleryPhotos: Joi.array().items(Joi.string().uri()).min(1).required(),
});

const updateSchema = Joi.object({
  ...baseFields,
  coverImage: Joi.string().uri().optional(),
  shopAct: Joi.string().uri().optional(),
  galleryPhotos: Joi.array().items(Joi.string().uri()).optional(),
});


function buildPayloadWithPlaceholders(req) {
  const body = { ...req.body };

  if (body.resortOwner) {
    try {
      body.resortOwner = typeof body.resortOwner === "string"
        ? JSON.parse(body.resortOwner)
        : body.resortOwner;
    } catch { body.resortOwner = {}; }
  }
  if (!body.resortOwner || typeof body.resortOwner !== "object") {
    const first = (...keys) => {
      for (const k of keys) {
        const v = body[k];
        if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
      }
      return "";
    };
    body.resortOwner = {
      firstName:    first("resortOwner[firstName]","resortOwner.firstName","resortOwnerFirstName"),
      lastName:     first("resortOwner[lastName]","resortOwner.lastName","resortOwnerLastName"),
      email:        first("resortOwner[email]","resortOwner.email","resortOwnerEmail","ownerEmail"),
      resortEmail:  first("resortOwner[resortEmail]","resortOwner.resortEmail","resortOwnerResortEmail","resortEmail"),
      mobile:       first("resortOwner[mobile]","resortOwner.mobile","resortOwnerMobile","mobile"),
      resortMobile: first("resortOwner[resortMobile]","resortOwner.resortMobile","resortOwnerResortMobile","resortMobile"),
    };
  }

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
    "totalRooms",
    "maxGuests",
    "pricingPerNightWeekdays",
    "pricingPerNightWeekend",
    "extraGuestCharge",
    "minStayNights",
  ].forEach((n) => {
    if (body[n] !== undefined && body[n] !== "") body[n] = Number(body[n]);
  });

  ["kycVerified", "publishNow", "featured"].forEach((b) => {
    if (body[b] === "true") body[b] = true;
    if (body[b] === "false") body[b] = false;
  });

  if (req.files?.coverImage?.length) body.coverImage = "https://placeholder.local/cover.jpg";
  if (req.files?.shopAct?.length) body.shopAct = "https://placeholder.local/shopact.pdf";
  if (req.files?.galleryPhotos?.length) {
    body.galleryPhotos = req.files.galleryPhotos.map(() => "https://placeholder.local/gallery.jpg");
  }

  return body;
}

export const validateCreateProperty = (req, res, next) => {
  const payload = buildPayloadWithPlaceholders(req);
  const { error } = createSchema.validate(payload, { allowUnknown: true, stripUnknown: true });
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

export const validateUpdateProperty = (req, res, next) => {
  const payload = buildPayloadWithPlaceholders(req);
  const { error } = updateSchema.validate(payload, { allowUnknown: true, stripUnknown: true });
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};
