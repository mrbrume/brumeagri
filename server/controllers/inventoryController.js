const logActivity = require('../utils/logActivity');
const Inventory = require('../models/Inventory');
const checkFarmAccess = require('../utils/checkFarmAccess');
const getFarmRole = require('../utils/getFarmRole');
const checkWriteAccess = require('../utils/checkWriteAccess');

// @route  POST /api/inventory
const createInventoryItem = async (req, res) => {
  try {
    const { farm, category, itemName, quantity, unit, unitCost, minThreshold } = req.body;

    if (!farm || !category || !itemName) {
      return res.status(400).json({ message: 'Farm, category, and item name are required' });
    }

    const farmDoc = await checkWriteAccess(farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Investors have read-only access and cannot add inventory.' });
    }

    const item = await Inventory.create({
      farm,
      category,
      itemName,
      quantity,
      unit,
      unitCost,
      minThreshold,
    });

    await logActivity(
  farm,
  req.user._id,
  'inventory',
  `Inventory updated: ${itemName} - ${quantity} ${unit || 'units'} added`
);

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/inventory/farm/:farmId
const getInventoryByFarm = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view inventory for this farm' });
    }

    const items = await Inventory.find({ farm: req.params.farmId }).sort({ category: 1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  PUT /api/inventory/:id
const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const farmDoc = await checkWriteAccess(item.farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Investors have read-only access and cannot update inventory.' });
    }

    const { itemName, quantity, unit, unitCost, minThreshold, category } = req.body;

    item.itemName = itemName || item.itemName;
    item.quantity = quantity !== undefined ? quantity : item.quantity;
    item.unit = unit || item.unit;
    item.unitCost = unitCost !== undefined ? unitCost : item.unitCost;
    item.minThreshold = minThreshold !== undefined ? minThreshold : item.minThreshold;
    item.category = category || item.category;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  DELETE /api/inventory/:id
const deleteInventoryItem = async (req, res) => {
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

module.exports = {
  createInventoryItem,
  getInventoryByFarm,
  updateInventoryItem,
  deleteInventoryItem,
};