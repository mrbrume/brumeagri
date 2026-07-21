const Crop = require('../models/Crop');
const checkFarmAccess = require('../utils/checkFarmAccess');
const getUserFarmIds = require('../utils/getUserFarmIds');
const getFarmRole = require('../utils/getFarmRole');
const checkWriteAccess = require('../utils/checkWriteAccess');

// @route  POST /api/crops
// @desc   Add a crop to a farm
const createCrop = async (req, res) => {
  try {
    const { farm, name, plantingDate, expectedHarvestDate, expectedYield, healthScore, status } = req.body;

    if (!farm || !name || !plantingDate) {
      return res.status(400).json({ message: 'Farm, name, and planting date are required' });
    }

    // Confirm the user actually has access to this farm
    const farmDoc = await checkWriteAccess(farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Investors have read-only access and cannot add crops.' });
    }

    const crop = await Crop.create({
      farm,
      name,
      plantingDate,
      expectedHarvestDate,
      expectedYield,
      healthScore,
      status,
    });

    res.status(201).json(crop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/crops/farm/:farmId
// @desc   Get all crops for a specific farm
const getCropsByFarm = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view crops for this farm' });
    }

    const crops = await Crop.find({ farm: req.params.farmId }).sort({ plantingDate: -1 });
    res.json(crops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  PUT /api/crops/:id
// @desc   Update a crop
const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const farmDoc = await checkWriteAccess(crop.farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Investors have read-only access and cannot update crops.' });
    }

    const { name, plantingDate, expectedHarvestDate, expectedYield, actualYield, healthScore, status } = req.body;

    crop.name = name || crop.name;
    crop.plantingDate = plantingDate || crop.plantingDate;
    crop.expectedHarvestDate = expectedHarvestDate || crop.expectedHarvestDate;
    crop.expectedYield = expectedYield || crop.expectedYield;
    crop.actualYield = actualYield !== undefined ? actualYield : crop.actualYield;
    crop.healthScore = healthScore !== undefined ? healthScore : crop.healthScore;
    crop.status = status || crop.status;

    const updatedCrop = await crop.save();
    res.json(updatedCrop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  DELETE /api/crops/:id
// @desc   Delete a crop
const deleteCrop = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const { farm, isAdmin, isOwner } = await getFarmRole(sale.farm, req.user._id);
    if (!farm || (!isOwner && !isAdmin)) {
      return res.status(403).json({ message: 'Only the farm owner or an admin can delete sales records' });
    }

    await sale.deleteOne();
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/crops/farm/:farmId/performance
// @desc   Get expected vs actual yield per crop (for chart)
const getCropPerformance = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view crop performance for this farm' });
    }

    const crops = await Crop.find({ farm: req.params.farmId }).select('name expectedYield actualYield status');
    res.json(crops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};
// @route  GET /api/crops
// @desc   Get all crops across every farm the logged-in user has access to
const getAllCrops = async (req, res) => {
  try {
    const farmIds = await getUserFarmIds(req.user._id);

    const crops = await Crop.find({ farm: { $in: farmIds } })
      .populate('farm', 'name location')
      .sort({ createdAt: -1 });

    res.json(crops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { createCrop, getCropsByFarm, updateCrop, deleteCrop, getCropPerformance, getAllCrops };