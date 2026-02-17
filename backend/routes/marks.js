const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Teacher: Add marks, view marks
router.post('/', auth, requireRole('teacher'), marksController.addMarks);
router.get(
  '/:studentId',
  auth,
  requireRole('admin', 'teacher', 'student'),
  marksController.getMarksByStudent
);

module.exports = router;
