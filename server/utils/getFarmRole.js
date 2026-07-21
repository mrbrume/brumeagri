const Farm = require('../models/Farm');
const User = require('../models/User');

// Returns { farm, isAdmin, isOwner, isManager, isInvestor } — or { farm: null } if farm doesn't exist
const getFarmRole = async (farmId, userId) => {
  const farm = await Farm.findById(farmId);
  if (!farm) return { farm: null };

  const user = await User.findById(userId).select('role');
  const isAdmin = user?.role === 'admin';
  const isOwner = farm.owner.toString() === userId.toString();
  const isManager = farm.managers.some((m) => m.toString() === userId.toString());
  const isInvestor = farm.investors.some((i) => i.toString() === userId.toString());

  return { farm, isAdmin, isOwner, isManager, isInvestor };
};

module.exports = getFarmRole;