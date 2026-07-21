const express = require('express');
const router = express.Router();
const {
  createInvestment,
  getMyInvestmentSummary,
  updateInvestment,
  getFarmInvestments,
} = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createInvestment);
router.get('/farm/:farmId/summary', getMyInvestmentSummary);
router.put('/:id', updateInvestment);
router.get('/farm/:farmId', getFarmInvestments);

module.exports = router;