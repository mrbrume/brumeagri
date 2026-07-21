const express = require('express');
const router = express.Router();
const {
  createInventoryItem,
  getInventoryByFarm,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { validateInventory } = require('../middleware/validators');

router.use(protect);

router.post('/', createInventoryItem);
router.get('/farm/:farmId', getInventoryByFarm);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.post('/', validateInventory, createInventoryItem);
router.put('/:id', validateInventory, updateInventoryItem);

module.exports = router;