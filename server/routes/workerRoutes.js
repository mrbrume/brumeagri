const express = require('express');
const router = express.Router();
const {
  createWorker,
  getWorkersByFarm,
  updateWorker,
  deleteWorker,
} = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');
const { validateWorker } = require('../middleware/validators');

router.use(protect);

router.post('/', createWorker);
router.get('/farm/:farmId', getWorkersByFarm);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);
router.post('/', validateWorker, createWorker);
router.put('/:id', validateWorker, updateWorker);

module.exports = router;