const express = require('express');
const router = express.Router();
const { getFarmWeather } = require('../controllers/weatherController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/farm/:farmId', getFarmWeather);

module.exports = router;