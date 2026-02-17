const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Must be before /:id so "me" is not parsed as ObjectId
router.get('/me', auth, requireRole('student'), studentController.getMe);

// Admin/Teacher: CRUD
router.get('/', auth, requireRole('admin', 'teacher'), studentController.getAll);
router.post('/', auth, requireRole('admin', 'teacher'), studentController.create);
router.get(
  '/:id',
  auth,
  requireRole('admin', 'teacher', 'student'),
  studentController.getById
);
router.put('/:id', auth, requireRole('admin', 'teacher'), studentController.update);
router.delete('/:id', auth, requireRole('admin'), studentController.remove);

module.exports = router;
