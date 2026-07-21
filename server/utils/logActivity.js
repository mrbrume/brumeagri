const ActivityLog = require('../models/ActivityLog');

// Call this from any controller after a successful create/update action
const logActivity = async (farmId, userId, type, message) => {
  try {
    await ActivityLog.create({ farm: farmId, user: userId, type, message });
  } catch (error) {
    // Don't let a logging failure break the main action (e.g. sale still succeeds even if logging fails)
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = logActivity;