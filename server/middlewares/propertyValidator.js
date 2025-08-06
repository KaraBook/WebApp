import Joi from "joi";

const propertySchema = Joi.object({
  propertyName: Joi.string().min(3).max(100).regex(/^[a-zA-Z0-9 ]+$/).required(),
  resortOwner: Joi.string().required(), 
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
  pricingPerNight: Joi.number().min(10).max(999999).required(),
  extraGuestCharge: Joi.number().min(0).max(9999).required(),
  checkInTime: Joi.string().required(),
  checkOutTime: Joi.string().required(),
  confirmationType: Joi.string().valid("auto", "manual").required(),
  minStayNights: Joi.number().min(1).max(999).required(),
  foodAvailability: Joi.array().items(Joi.string().valid("breakfast", "lunch", "dinner")),
  amenities: Joi.array().items(Joi.string()),
  nearbyAttractions: Joi.string().min(5).max(250),
  gstin: Joi.string().length(15),
  pan: Joi.string().length(10),
  kycVerified: Joi.boolean().required(),
  approvalStatus: Joi.string().valid("pending", "approved", "rejected"),
  publishNow: Joi.boolean().required(),
  internalNotes: Joi.string().max(500).allow(""),
});

export const validateProperty = (req, res, next) => {
  const { error } = propertySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};
