const ActivityLog = require('../models/ActivityLog');
const checkFarmAccess = require('../utils/checkFarmAccess');

// @route  GET /api/activity/farm/:farmId
// @desc   Get recent activity for a farm (most recent first)
const getRecentActivity = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view activity for this farm' });
    }

    // Limit to most recent 10 by default; frontend can request more via ?limit=
    const limit = parseInt(req.query.limit) || 10;

    const activity = await ActivityLog.find({ farm: req.params.farmId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { getRecentActivity };