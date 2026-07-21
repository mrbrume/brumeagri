const logActivity = require('../utils/logActivity');
const Sale = require('../models/Sale');
const checkFarmAccess = require('../utils/checkFarmAccess');
const getFarmRole = require('../utils/getFarmRole');
const checkWriteAccess = require('../utils/checkWriteAccess');

// @route  POST /api/sales
const createSale = async (req, res) => {
  try {
    const { farm, product, quantity, unit, customer, amount, date } = req.body;

    if (!farm || !product || !quantity || !customer || !amount) {
      return res.status(400).json({ message: 'Farm, product, quantity, customer, and amount are required' });
    }

    const farmDoc = await checkWriteAccess(farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Investors have read-only access and cannot record sales.' });
    }

    const sale = await Sale.create({ farm, product, quantity, unit, customer, amount, date });
    await logActivity(
  farm,
  req.user._id,
  'sale',
  `Sale recorded: ${quantity} ${unit || 'units'} of ${product} - ₦${amount.toLocaleString()}`
);
    res.status(201).json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/sales/farm/:farmId
const getSalesByFarm = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view sales for this farm' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find({ farm: req.params.farmId }).sort({ date: -1 }).skip(skip).limit(limit),
      Sale.countDocuments({ farm: req.params.farmId }),
    ]);

    res.json({ sales, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/sales/farm/:farmId/total
// @desc   Get total revenue for a farm (used by dashboard later)
const getTotalRevenue = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view revenue for this farm' });
    }

    const result = await Sale.aggregate([
      { $match: { farm: farmDoc._id } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
    res.json({ totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  DELETE /api/sales/:id
const deleteSale = async (req, res) => {
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

// @route  GET /api/sales/farm/:farmId/monthly
// @desc   Get revenue grouped by month (for charts)
const getMonthlyRevenue = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view revenue for this farm' });
    }

    const monthlyData = await Sale.aggregate([
      { $match: { farm: farmDoc._id } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          totalRevenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json(monthlyData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};
module.exports = { createSale, getSalesByFarm, getTotalRevenue, getMonthlyRevenue, deleteSale };