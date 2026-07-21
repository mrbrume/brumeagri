const Farm = require('../models/Farm');
const User = require('../models/User');
const getFarmRole = require('../utils/getFarmRole');
const Crop = require('../models/Crop');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');
const Investment = require('../models/Investment');

// @route  POST /api/farms
// @desc   Create a new farm (owner only)
const createFarm = async (req, res) => {
  try {
    const { name, location, size, description } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Name and location are required' });
    }

    const farm = await Farm.create({
      name,
      location,
      size,
      description,
      owner: req.user._id, // comes from the protect middleware
    });

    res.status(201).json(farm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/farms
// @desc   Get all farms belonging to the logged-in user (as owner or manager)
const getFarms = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? {} // admins see every farm in the system
      : {
          $or: [
            { owner: req.user._id },
            { managers: req.user._id },
            { investors: req.user._id },
          ],
        };

    const farms = await Farm.find(query)
      .populate('owner', 'name email')
      .populate('managers', 'name email')
      .populate('investors', 'name email');

    res.json(farms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/farms/:id
// @desc   Get a single farm's details
const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('managers', 'name email')
      .populate('investors', 'name email');

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    res.json(farm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  PUT /api/farms/:id
// @desc   Update a farm (owner only)
const updateFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Only the owner can edit
    if (farm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this farm' });
    }

    const { name, location, size, description } = req.body;

    farm.name = name || farm.name;
    farm.location = location || farm.location;
    farm.size = size || farm.size;
    farm.description = description || farm.description;

    const updatedFarm = await farm.save();
    res.json(updatedFarm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  DELETE /api/farms/:id
// @desc   Delete a farm (owner only)
const deleteFarm = async (req, res) => {
  try {
    const { farm, isAdmin, isOwner } = await getFarmRole(req.params.id, req.user._id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the farm owner or an admin can delete this farm' });
    }

    // Clean up every record tied to this farm before deleting it
    await Promise.all([
      Crop.deleteMany({ farm: farm._id }),
      Inventory.deleteMany({ farm: farm._id }),
      Sale.deleteMany({ farm: farm._id }),
      Expense.deleteMany({ farm: farm._id }),
      Worker.deleteMany({ farm: farm._id }),
      Attendance.deleteMany({ farm: farm._id }),
      ActivityLog.deleteMany({ farm: farm._id }),
      Investment.deleteMany({ farm: farm._id }),
    ]);

    await farm.deleteOne();
    res.json({ message: 'Farm and all related records deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  POST /api/farms/:id/investors
// @desc   Add a user as an investor on this farm (owner only)
const addInvestorToFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (farm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add investors to this farm' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Investor email is required' });
    }

    const investorUser = await User.findOne({ email: email.toLowerCase() });
    if (!investorUser) {
      return res.status(404).json({ message: 'No BrumeAgri user found with that email' });
    }

    if (!farm.investors.includes(investorUser._id)) {
      farm.investors.push(investorUser._id);
      await farm.save();
    }

    res.json({
      message: `${investorUser.name} added as an investor`,
      farm,
      investor: { _id: investorUser._id, name: investorUser.name, email: investorUser.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  POST /api/farms/:id/managers
// @desc   Add a user as a manager on this farm (owner only)
const addManagerToFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (farm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add managers to this farm' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Manager email is required' });
    }

    const managerUser = await User.findOne({ email: email.toLowerCase() });
    if (!managerUser) {
      return res.status(404).json({ message: 'No BrumeAgri user found with that email' });
    }

    if (!farm.managers.includes(managerUser._id)) {
      farm.managers.push(managerUser._id);
      await farm.save();
    }

    res.json({
      message: `${managerUser.name} added as a manager`,
      farm,
      manager: { _id: managerUser._id, name: managerUser.name, email: managerUser.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  DELETE /api/farms/:id/managers/:userId
const removeManagerFromFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    if (farm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the farm owner can remove managers' });
    }
    farm.managers = farm.managers.filter((m) => m.toString() !== req.params.userId);
    await farm.save();
    res.json({ message: 'Manager removed', farm });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  DELETE /api/farms/:id/investors/:userId
const removeInvestorFromFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    if (farm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the farm owner can remove investors' });
    }
    farm.investors = farm.investors.filter((i) => i.toString() !== req.params.userId);
    await farm.save();
    res.json({ message: 'Investor removed', farm });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = {
  createFarm, getFarms, getFarmById, updateFarm, deleteFarm,
  addInvestorToFarm, addManagerToFarm, removeManagerFromFarm, removeInvestorFromFarm,
};