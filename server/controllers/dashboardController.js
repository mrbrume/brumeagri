const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');
const Worker = require('../models/Worker');
const checkFarmAccess = require('../utils/checkFarmAccess');

// @route  GET /api/dashboard/farm/:farmId
const getDashboardSummary = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view this dashboard' });
    }

    const farmId = farmDoc._id;

    // Run all calculations in parallel instead of one-by-one, for speed
    const [revenueResult, expenseResult, inventoryItems, activeWorkerCount] = await Promise.all([
      Sale.aggregate([
        { $match: { farm: farmId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { farm: farmId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Inventory.find({ farm: farmId }),
      Worker.countDocuments({ farm: farmId, status: 'active' }),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const totalExpenses = expenseResult.length > 0 ? expenseResult[0].total : 0;
    const monthlyProfit = totalRevenue - totalExpenses;

    // Inventory value: sum of quantity for now (you can multiply by unit cost later if you add that field)
    const inventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const lowStockItems = inventoryItems.filter((item) => item.quantity <= item.minThreshold);

    res.json({
      totalRevenue,
      totalExpenses,
      monthlyProfit,
      inventoryValue,
      activeWorkers: activeWorkerCount,
      lowStockItemsCount: lowStockItems.length,
      lowStockItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { getDashboardSummary };