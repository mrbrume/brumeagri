const User = require('../models/User');
const Farm = require('../models/Farm');

// @route  GET /api/admin/stats
// @desc   System-wide overview stats (admin only)
const getSystemStats = async (req, res) => {
  try {
    const [totalUsers, totalFarms, ownerCount, managerCount, investorCount, adminCount] = await Promise.all([
      User.countDocuments(),
      Farm.countDocuments(),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'investor' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    res.json({
      totalUsers,
      totalFarms,
      roleBreakdown: {
        owner: ownerCount,
        manager: managerCount,
        investor: investorCount,
        admin: adminCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/admin/users
// @desc   List every user in the system (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/admin/farms
// @desc   List every farm in the system, with owner info (admin only)
const getAllFarms = async (req, res) => {
  try {
    const farms = await Farm.find()
      .populate('owner', 'name email')
      .populate('managers', 'name email')
      .populate('investors', 'name email')
      .sort({ createdAt: -1 });
    res.json(farms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { getSystemStats, getAllUsers, getAllFarms };