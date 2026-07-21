const express = require('express');
const router = express.Router();
const { getRecentActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/farm/:farmId', getRecentActivity);

module.exports = router;