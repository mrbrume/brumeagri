const logActivity = require('../utils/logActivity');
const Expense = require('../models/Expense');
const checkFarmAccess = require('../utils/checkFarmAccess');
const getFarmRole = require('../utils/getFarmRole');

// @route  POST /api/expenses
const createExpense = async (req, res) => {
  try {
    const { farm, category, description, amount, date } = req.body;

    if (!farm || !category || !amount) {
      return res.status(400).json({ message: 'Farm, category, and amount are required' });
    }

    const farmDoc = await checkFarmAccess(farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to record expenses for this farm' });
    }

    const expense = await Expense.create({ farm, category, description, amount, date });
    await logActivity(
  farm,
  req.user._id,
  'expense',
  `Expense added: ${category} - ₦${amount.toLocaleString()}`
);
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/expenses/farm/:farmId
const getExpensesByFarm = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view expenses for this farm' });
    }

    const expenses = await Expense.find({ farm: req.params.farmId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/expenses/farm/:farmId/total
const getTotalExpenses = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view expenses for this farm' });
    }

    const result = await Expense.aggregate([
      { $match: { farm: farmDoc._id } },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } },
    ]);

    const totalExpenses = result.length > 0 ? result[0].totalExpenses : 0;
    res.json({ totalExpenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
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

// @route  GET /api/expenses/farm/:farmId/monthly
// @desc   Get expenses grouped by month (for charts)
const getMonthlyExpenses = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view expenses for this farm' });
    }

    const monthlyData = await Expense.aggregate([
      { $match: { farm: farmDoc._id } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          totalExpenses: { $sum: '$amount' },
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

module.exports = { createExpense, getExpensesByFarm, getTotalExpenses, getMonthlyExpenses, deleteExpense };