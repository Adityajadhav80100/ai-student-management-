const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Analytics endpoints (AI)
router.post(
  '/predict',
  auth,
  requireRole('admin', 'teacher', 'student'),
  analyticsController.predictPerformance
);
router.post(
  '/dropout',
  auth,
  requireRole('admin', 'teacher', 'student'),
  analyticsController.detectDropoutRisk
);
router.post(
  '/attendance-trend',
  auth,
  requireRole('admin', 'teacher', 'student'),
  analyticsController.analyzeAttendanceTrend
);
router.post(
  '/recommend',
  auth,
  requireRole('admin', 'teacher', 'student'),
  analyticsController.generateRecommendations
);

module.exports = router;
