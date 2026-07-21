const express = require('express');
const router = express.Router();
const {
  generateSalesReport,
  generateExpenseReport,
  generateInventoryReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/farm/:farmId/sales', generateSalesReport);
router.get('/farm/:farmId/expenses', generateExpenseReport);
router.get('/farm/:farmId/inventory', generateInventoryReport);

module.exports = router;