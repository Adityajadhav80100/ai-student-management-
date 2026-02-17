const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/admin/overview', auth, requireRole('admin'), analyticsController.getAdminOverview);
router.get('/student/me', auth, requireRole('student'), analyticsController.getMyAnalytics);
router.get(
  '/student/:id',
  auth,
  requireRole('admin', 'teacher', 'student', 'hod'),
  analyticsController.getStudentAnalytics
);

router.get(
  '/hod/department',
  auth,
  requireRole('hod'),
  analyticsController.getHodDepartmentAnalytics
);

module.exports = router;
