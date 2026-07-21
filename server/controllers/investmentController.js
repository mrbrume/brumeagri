const Investment = require('../models/Investment');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const checkFarmAccess = require('../utils/checkFarmAccess');

// @route  POST /api/investments
// @desc   Create an investment record (farm owner registers an investor's stake)
const createInvestment = async (req, res) => {
  try {
    const { farm, investor, amount, sharePercentage, investmentDate, nextPayoutDate } = req.body;

    if (!farm || !investor || !amount || !sharePercentage || !investmentDate) {
      return res.status(400).json({ message: 'Farm, investor, amount, sharePercentage, and investmentDate are required' });
    }

    const farmDoc = await checkFarmAccess(farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to register investments for this farm' });
    }

    const investment = await Investment.create({
      farm, investor, amount, sharePercentage, investmentDate, nextPayoutDate,
    });

    res.status(201).json(investment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This investor already has an investment record for this farm' });
    }
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/investments/farm/:farmId/summary
// @desc   Get the logged-in investor's investment summary + computed ROI for this farm
const getMyInvestmentSummary = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      farm: req.params.farmId,
      investor: req.user._id,
    });

    if (!investment) {
      return res.status(404).json({ message: 'No investment record found for you on this farm' });
    }

    // Calculate cumulative profit since the investment date
    const [revenueResult, expenseResult] = await Promise.all([
      Sale.aggregate([
        { $match: { farm: investment.farm, date: { $gte: investment.investmentDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { farm: investment.farm, date: { $gte: investment.investmentDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const revenueSinceInvestment = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const expensesSinceInvestment = expenseResult.length > 0 ? expenseResult[0].total : 0;
    const profitSinceInvestment = revenueSinceInvestment - expensesSinceInvestment;

    const returnsToDate = Math.round(profitSinceInvestment * (investment.sharePercentage / 100));
    const roiPercentage = investment.amount > 0
      ? Number(((returnsToDate / investment.amount) * 100).toFixed(1))
      : 0;

    res.json({
      investment,
      revenueSinceInvestment,
      expensesSinceInvestment,
      profitSinceInvestment,
      returnsToDate,
      roiPercentage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  PUT /api/investments/:id
const updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const farmDoc = await checkFarmAccess(investment.farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to update this investment' });
    }

    const { amount, sharePercentage, nextPayoutDate } = req.body;

    investment.amount = amount !== undefined ? amount : investment.amount;
    investment.sharePercentage = sharePercentage !== undefined ? sharePercentage : investment.sharePercentage;
    investment.nextPayoutDate = nextPayoutDate || investment.nextPayoutDate;

    const updated = await investment.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/investments/farm/:farmId
// @desc   Get all investment records for a farm (owner only)
const getFarmInvestments = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view investments for this farm' });
    }

    if (farmDoc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the farm owner can view all investment records' });
    }

    const investments = await Investment.find({ farm: req.params.farmId }).populate('investor', 'name email');
    res.json(investments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { createInvestment, getMyInvestmentSummary, updateInvestment, getFarmInvestments };