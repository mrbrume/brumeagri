const Farm = require('../models/Farm');

// Returns an array of farm IDs the user owns or manages
const getUserFarmIds = async (userId) => {
  const farms = await Farm.find({
    $or: [{ owner: userId }, { managers: userId }],
  }).select('_id');

  return farms.map((f) => f._id);
};

module.exports = getUserFarmIds;