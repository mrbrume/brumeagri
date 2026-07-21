const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getTodayAttendanceSummary,
  getAttendanceByFarm,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', markAttendance);
router.get('/farm/:farmId/today', getTodayAttendanceSummary);
router.get('/farm/:farmId', getAttendanceByFarm);

module.exports = router;