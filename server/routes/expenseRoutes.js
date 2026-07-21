const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpensesByFarm,
  getTotalExpenses,
  getMonthlyExpenses,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { validateExpense } = require('../middleware/validators');

router.use(protect);

router.post('/', createExpense);
router.get('/farm/:farmId', getExpensesByFarm);
router.get('/farm/:farmId/total', getTotalExpenses);
router.delete('/:id', deleteExpense);
router.get('/farm/:farmId/monthly', getMonthlyExpenses);
router.post('/', validateExpense, createExpense);

module.exports = router;