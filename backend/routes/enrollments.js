const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.post(
  '/auto/:studentProfileId',
  auth,
  requireRole('admin', 'hod'),
  enrollmentController.autoEnroll
);

router.delete(
  '/:studentProfileId',
  auth,
  requireRole('admin', 'hod'),
  enrollmentController.removeEnrollments
);

module.exports = router;
