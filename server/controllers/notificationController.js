const Inventory = require('../models/Inventory');
const Crop = require('../models/Crop');
const checkFarmAccess = require('../utils/checkFarmAccess');

// @route  GET /api/notifications/farm/:farmId
// @desc   Get computed notifications for a farm (low stock, harvest due soon)
const getNotifications = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view notifications for this farm' });
    }

    const farmId = req.params.farmId;
    const notifications = [];

    // 1. Low stock items
    const inventoryItems = await Inventory.find({ farm: farmId });
    inventoryItems.forEach((item) => {
      if (item.quantity <= item.minThreshold) {
        notifications.push({
          type: 'low_stock',
          severity: 'warning',
          message: `Low ${item.itemName} stock`,
          detail: `${item.itemName} at ${item.quantity} ${item.unit}, below ${item.minThreshold} threshold`,
          createdAt: item.updatedAt,
        });
      }
    });

    // 2. Harvests due within the next 3 days
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const upcomingHarvests = await Crop.find({
      farm: farmId,
      expectedHarvestDate: { $gte: now, $lte: threeDaysFromNow },
      status: { $ne: 'harvested' },
    });

    upcomingHarvests.forEach((crop) => {
      notifications.push({
        type: 'harvest_due',
        severity: 'info',
        message: 'Harvest due soon',
        detail: `${crop.name} expected harvest on ${crop.expectedHarvestDate.toDateString()}`,
        createdAt: crop.updatedAt,
      });
    });

    // Sort newest-relevant first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { getNotifications };