const getFarmRole = require('./getFarmRole');

// Returns the farm if the user can WRITE to it (owner, manager, or admin).
// Investors are explicitly excluded — they get read-only access via checkFarmAccess instead.
const checkWriteAccess = async (farmId, userId) => {
  const { farm, isAdmin, isOwner, isManager } = await getFarmRole(farmId, userId);
  if (!farm) return null;
  if (!isOwner && !isManager && !isAdmin) return null;
  return farm;
};

module.exports = checkWriteAccess;