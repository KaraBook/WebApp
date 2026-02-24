import User from "../models/User.js";

export const getEffectiveOwnerId = async (req) => {
  const userId = req.user?.id || req.user?._id;

  if (!userId) throw new Error("Unauthenticated");

  const user = await User.findById(userId).select("roles primaryRole createdBy");

  if (!user) throw new Error("User not found");

  const roles = Array.isArray(user.roles)
    ? user.roles
    : (user.primaryRole ? [user.primaryRole] : []);

  if (roles.includes("manager") && user.createdBy) {
    return user.createdBy;
  }

  return user._id;
};