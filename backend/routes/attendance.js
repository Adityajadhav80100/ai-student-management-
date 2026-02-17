const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Teacher: Add attendance, view history
router.post('/', auth, requireRole('teacher'), attendanceController.addAttendance);
router.get(
  '/:studentId',
  auth,
  requireRole('admin', 'teacher', 'student'),
  attendanceController.getAttendanceByStudent
);

module.exports = router;
