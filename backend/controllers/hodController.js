const TeacherProfile = require('../models/TeacherProfile');
const { getDepartmentForHod } = require('../utils/hodUtils');

exports.listTeachers = async (req, res, next) => {
  try {
    const department = await getDepartmentForHod(req.user.userId);
    const teachers = await TeacherProfile.find({ department: department._id })
      .sort({ fullName: 1 })
      .populate('department', 'name code')
      .populate('subjectsHandled', 'name code semester')
      .populate('userId', 'email role');
    res.json({
      department: {
        id: department._id,
        name: department.name,
        code: department.code,
      },
      teachers,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDepartment = async (req, res, next) => {
  try {
    const department = await getDepartmentForHod(req.user.userId);
    res.json({
      department: {
        id: department._id,
        name: department.name,
        code: department.code,
      },
    });
  } catch (err) {
    next(err);
  }
};
