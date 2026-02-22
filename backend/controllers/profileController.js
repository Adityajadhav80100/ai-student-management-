const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const AdminProfile = require('../models/AdminProfile');
const User = require('../models/User');
const enrollmentService = require('../services/enrollmentService');

async function markUserProfileCompleted(userId) {
  await User.findByIdAndUpdate(userId, { profileCompleted: true });
}

exports.upsertStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Student profile payload', req.body);
    }
    const payload = {
      userId,
      fullName: req.body.fullName,
      rollNumber: req.body.rollNumber,
      department: req.body.department,
      semester: req.body.semester,
      phone: req.body.phone,
      address: req.body.address,
      parentContact: req.body.parentContact,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : req.body.photoUrl,
      currentCGPA: req.body.currentCGPA,
      section: req.body.section,
    };

    const existing = await StudentProfile.findOne({ userId });
    let profile;
    if (!existing) {
      profile = await StudentProfile.create(payload);
      await enrollmentService.enrollStudentInSemesterSubjects(profile._id);
    } else {
      const prevSemester = existing.semester;
      const prevDepartment = existing.department?.toString();
      profile = await StudentProfile.findOneAndUpdate(
        { userId },
        payload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      const newSemester = payload.semester;
      const newDepartment = payload.department?.toString?.() || '';
      const semesterChanged = prevSemester !== newSemester;
      const departmentChanged = prevDepartment !== newDepartment;
      if (semesterChanged || departmentChanged) {
        await enrollmentService.updateStudentSemesterEnrollment(profile._id, newSemester);
      } else {
        await enrollmentService.enrollStudentInSemesterSubjects(profile._id);
      }
    }

    await markUserProfileCompleted(userId);

    res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
};

exports.upsertTeacherProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const payload = {
      userId,
      fullName: req.body.fullName,
      employeeId: req.body.employeeId,
      department: req.body.department,
      subjectsHandled: req.body.subjectsHandled,
      phone: req.body.phone,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : req.body.photoUrl,
    };

    const profile = await TeacherProfile.findOneAndUpdate(
      { userId },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await markUserProfileCompleted(userId);

    res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
};

exports.upsertAdminProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const payload = {
      userId,
      name: req.body.name,
      institutionName: req.body.institutionName,
      logoUrl: req.file ? `/uploads/${req.file.filename}` : req.body.logoUrl,
    };

    const profile = await AdminProfile.findOneAndUpdate(
      { userId },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await markUserProfileCompleted(userId);

    res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
};

