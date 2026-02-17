const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const {
  departmentBody,
  departmentUpdateBody,
  subjectBody,
  subjectUpdateBody,
  subjectQuery,
  assignTeacherBody,
  teacherBody,
  teacherUpdateBody,
  teacherQuery,
  timetableBody,
  timetableQuery,
  assignHodBody,
} = require('../validators/adminSchemas');

router.use(auth, requireRole('admin'));

router.post('/departments', validate({ body: departmentBody }), adminController.createDepartment);
router.get('/departments', adminController.listDepartments);
router.put(
  '/departments/:id',
  validate({ body: departmentUpdateBody }),
  adminController.updateDepartment
);
router.delete('/departments/:id', adminController.deleteDepartment);

router.post('/subjects', validate({ body: subjectBody }), adminController.createSubject);
router.get('/subjects', validate({ query: subjectQuery }), adminController.listSubjects);
router.put('/subjects/:id', validate({ body: subjectUpdateBody }), adminController.updateSubject);
router.put(
  '/subjects/:id/assign-teacher',
  validate({ body: assignTeacherBody }),
  adminController.assignTeacher
);

router.post('/teachers', validate({ body: teacherBody }), adminController.createTeacher);
router.get('/teachers', validate({ query: teacherQuery }), adminController.listTeachers);
router.get('/teachers/:id', adminController.getTeacher);
router.put('/teachers/:id', validate({ body: teacherUpdateBody }), adminController.updateTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

router.post('/timetables', validate({ body: timetableBody }), adminController.createTimetableEntry);
router.get('/timetables', validate({ query: timetableQuery }), adminController.listTimetableEntries);
router.delete('/timetables/:id', adminController.deleteTimetableEntry);

router.put('/departments/:id/hod', validate({ body: assignHodBody }), adminController.assignHod);

module.exports = router;
