const express = require('express');
const router = express.Router();
const {
  createSale,
  getSalesByFarm,
  getTotalRevenue,
  getMonthlyRevenue,
  deleteSale,
} = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');
const { validateSale } = require('../middleware/validators');

router.use(protect);

router.post('/', createSale);
router.get('/farm/:farmId', getSalesByFarm);
router.get('/farm/:farmId/total', getTotalRevenue);
router.delete('/:id', deleteSale);
router.get('/farm/:farmId/monthly', getMonthlyRevenue);
router.post('/', validateSale, createSale);

module.exports = router;