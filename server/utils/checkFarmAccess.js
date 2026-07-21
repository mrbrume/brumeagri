const Farm = require('../models/Farm');
const User = require('../models/User');

// Returns the farm if the user is the owner, a manager, an investor, or a system admin — otherwise null
const checkFarmAccess = async (farmId, userId) => {
  const farm = await Farm.findById(farmId);
  if (!farm) return null;

  const user = await User.findById(userId).select('role');
  if (user && user.role === 'admin') return farm; // admins see every farm, system-wide

  const isOwner = farm.owner.toString() === userId.toString();
  const isManager = farm.managers.some((m) => m.toString() === userId.toString());
  const isInvestor = farm.investors.some((i) => i.toString() === userId.toString());

  if (!isOwner && !isManager && !isInvestor) return null;

  return farm;
};

module.exports = checkFarmAccess;