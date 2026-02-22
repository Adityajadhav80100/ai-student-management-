const enrollmentService = require('../services/enrollmentService');
const StudentProfile = require('../models/StudentProfile');

exports.autoEnroll = async (req, res, next) => {
  try {
    const { studentProfileId } = req.params;
    const profile = await StudentProfile.findById(studentProfileId);
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    const enrollments = await enrollmentService.enrollStudentInSemesterSubjects(studentProfileId);
    res.json({
      message: 'Enrollment complete',
      enrolledCount: enrollments.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.removeEnrollments = async (req, res, next) => {
  try {
    const { studentProfileId } = req.params;
    const profile = await StudentProfile.findById(studentProfileId);
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    await enrollmentService.removeStudentEnrollments(studentProfileId);
    res.json({ message: 'Enrollments cleared' });
  } catch (err) {
    next(err);
  }
};
