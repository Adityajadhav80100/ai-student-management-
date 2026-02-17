const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/me', auth, requireRole('student'), studentController.getMe);
router.get('/attendance', auth, requireRole('student'), studentController.getAttendance);
router.get('/marks', auth, requireRole('student'), studentController.getMarks);

router.get('/', auth, requireRole('admin', 'teacher', 'hod'), studentController.listAll);
router.get('/:id', auth, requireRole('admin', 'teacher', 'hod'), studentController.getById);

module.exports = router;
