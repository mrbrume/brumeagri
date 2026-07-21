const express = require('express');
const router = express.Router();
const {
  createFarm, getFarms, getFarmById, updateFarm, deleteFarm,
  addInvestorToFarm, addManagerToFarm, removeManagerFromFarm, removeInvestorFromFarm,
} = require('../controllers/farmController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateFarm } = require('../middleware/validators');

// All farm routes require login
router.use(protect);

router.post('/', authorize('owner'), createFarm);
router.get('/', getFarms);
router.get('/:id', getFarmById);
router.put('/:id', authorize('owner'), updateFarm);
router.delete('/:id', deleteFarm);
router.post('/:id/investors', authorize('owner'), addInvestorToFarm);
router.post('/:id/managers', authorize('owner'), addManagerToFarm);
router.delete('/:id/managers/:userId', removeManagerFromFarm);
router.delete('/:id/investors/:userId', removeInvestorFromFarm);
router.post('/', validateFarm, createFarm);
router.put('/:id', validateFarm, updateFarm);

module.exports = router;