const express = require('express');
const router = express.Router();
const {
  createCrop,
  getCropsByFarm,
  updateCrop,
  deleteCrop,
  getCropPerformance,
  getAllCrops,
} = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');
const { validateCrop } = require('../middleware/validators');

router.use(protect);

router.post('/', createCrop);
router.get('/', getAllCrops);
router.get('/farm/:farmId', getCropsByFarm);
router.get('/farm/:farmId/performance', getCropPerformance);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);
router.post('/', validateCrop, createCrop);
router.put('/:id', validateCrop, updateCrop);

module.exports = router;