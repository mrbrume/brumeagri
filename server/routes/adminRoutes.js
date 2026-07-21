const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers, getAllFarms } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // every route in this file requires admin role

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.get('/farms', getAllFarms);

module.exports = router;