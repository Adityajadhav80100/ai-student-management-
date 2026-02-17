const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  studentProfileBody,
  teacherProfileBody,
  adminProfileBody,
} = require('../validators/profileSchemas');

// Student profile create/update
router.post(
  '/student',
  auth,
  requireRole('student'),
  upload.single('photo'),
  validate({ body: studentProfileBody }),
  profileController.upsertStudentProfile
);

// Teacher profile create/update
router.post(
  '/teacher',
  auth,
  requireRole('teacher'),
  upload.single('photo'),
  validate({ body: teacherProfileBody }),
  profileController.upsertTeacherProfile
);

// Admin profile create/update
router.post(
  '/admin',
  auth,
  requireRole('admin'),
  upload.single('logo'),
  validate({ body: adminProfileBody }),
  profileController.upsertAdminProfile
);

module.exports = router;

