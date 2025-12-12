import User from "../models/User.js";

export const getEffectiveOwnerId = async (req) => {
  if (req.user.role === "manager") {
    const manager = await User.findById(req.user.id).select("createdBy");
    return manager.createdBy; 
  }
  return req.user.id; 
};
