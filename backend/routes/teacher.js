const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const {
  teacherAttendanceBody,
  teacherMarksBody,
  attendanceQuery,
  marksQuery,
} = require('../validators/teacherSchemas');

router.use(auth, requireRole('teacher', 'hod'));

router.get('/subjects', teacherController.getSubjects);
router.get('/subjects/:id/students', teacherController.getSubjectStudents);

router.post(
  '/attendance',
  validate({ body: teacherAttendanceBody }),
  teacherController.recordAttendance
);
router.get('/attendance', validate({ query: attendanceQuery }), teacherController.getAttendance);

router.post('/marks', validate({ body: teacherMarksBody }), teacherController.recordMarks);
router.get('/marks', validate({ query: marksQuery }), teacherController.getMarks);

module.exports = router;
