const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const hodController = require('../controllers/hodController');

router.use(auth, requireRole('hod'));

router.get('/teachers', hodController.listTeachers);
router.get('/department', hodController.getDepartment);

module.exports = router;
