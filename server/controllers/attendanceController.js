const Attendance = require('../models/Attendance');
const Worker = require('../models/Worker');
const checkFarmAccess = require('../utils/checkFarmAccess');
const checkWriteAccess = require('../utils/checkWriteAccess');

// Helper: normalize any date to midnight, so "today" always matches regardless of what time it is
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @route  POST /api/attendance
// @desc   Mark or update a worker's attendance for a given date (defaults to today)
const markAttendance = async (req, res) => {
  try {
    const { farm, worker, status, date } = req.body;

    if (!farm || !worker || !status) {
      return res.status(400).json({ message: 'Farm, worker, and status are required' });
    }

    const farmDoc = await checkWriteAccess(farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Investors have read-only access and cannot mark attendance.' });
    }

    const attendanceDate = startOfDay(date || new Date());

    // "Upsert": update the record if it exists for this worker+date, otherwise create it
    const attendance = await Attendance.findOneAndUpdate(
      { worker, date: attendanceDate },
      { farm, worker, date: attendanceDate, status },
      { new: true, upsert: true }
    );

    res.status(200).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/attendance/farm/:farmId/today
// @desc   Get today's attendance summary for a farm (e.g. 16/18, 2 on leave)
const getTodayAttendanceSummary = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view attendance for this farm' });
    }

    const today = startOfDay(new Date());

    // Total active workers on this farm
    const totalActiveWorkers = await Worker.countDocuments({ farm: req.params.farmId, status: 'active' });

    // Today's attendance records
    const todayRecords = await Attendance.find({ farm: req.params.farmId, date: today });

    const presentCount = todayRecords.filter((r) => r.status === 'present').length;
    const onLeaveCount = todayRecords.filter((r) => r.status === 'leave').length;
    const absentCount = todayRecords.filter((r) => r.status === 'absent').length;

    res.json({
      totalActiveWorkers,
      present: presentCount,
      onLeave: onLeaveCount,
      absent: absentCount,
      // Workers with no record yet today are treated as "not yet checked in", not "absent"
      notYetRecorded: totalActiveWorkers - todayRecords.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/attendance/farm/:farmId?date=YYYY-MM-DD
// @desc   Get full attendance list for a farm on a given date (defaults to today)
const getAttendanceByFarm = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view attendance for this farm' });
    }

    const targetDate = startOfDay(req.query.date || new Date());

    const records = await Attendance.find({ farm: req.params.farmId, date: targetDate })
      .populate('worker', 'name position');

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { markAttendance, getTodayAttendanceSummary, getAttendanceByFarm };