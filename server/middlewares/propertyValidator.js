import Joi from "joi";

const propertySchema = Joi.object({
  propertyName: Joi.string().min(3).max(100).regex(/^[a-zA-Z0-9 ]+$/).required(),
  resortOwner: Joi.object({
    firstName: Joi.string().min(2).max(50).regex(/^[a-zA-Z ]+$/).required(),
    lastName: Joi.string().min(2).max(50).regex(/^[a-zA-Z ]+$/).required(),
    email: Joi.string().email().required(),
    resortEmail: Joi.string().email().required(),
    mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    resortMobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  }).required(),
  propertyType: Joi.string().valid("villa", "tent", "cottage", "apartment").required(),
  description: Joi.string().min(30).max(500).required(),
  addressLine1: Joi.string().min(5).max(100).required(),
  addressLine2: Joi.string().max(100).allow(""),
  state: Joi.string().required(),
  city: Joi.string().required(),
  pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  locationLink: Joi.string().uri().required(),
  totalRooms: Joi.number().min(1).max(999).required(),
  maxGuests: Joi.number().min(1).max(999).required(),
  roomTypes: Joi.array().items(Joi.string().min(2).max(50)),
  pricingPerNightWeekdays: Joi.number().min(10).max(999999).required(),
  pricingPerNightWeekend: Joi.number().min(10).max(999999).required(),
  extraGuestCharge: Joi.number().min(0).max(9999).required(),
  checkInTime: Joi.string().required(),
  checkOutTime: Joi.string().required(),
  minStayNights: Joi.number().min(1).max(999).required(),
  foodAvailability: Joi.array().items(Joi.string().valid("breakfast", "lunch", "dinner")),
  amenities: Joi.array().items(Joi.string()),
  pan: Joi.string().length(10),
  kycVerified: Joi.boolean().required(),
  publishNow: Joi.boolean().required(),
  featured: Joi.boolean().default(false),
  approvalStatus: Joi.string().valid("pending", "approved", "rejected").default("pending"),
  internalNotes: Joi.string().max(500).allow(""),
});

export const validateProperty = (req, res, next) => {
  const { error } = propertySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};
