const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const analyticsService = require('../services/analyticsService');
const { determineRiskLevel } = require('../utils/riskUtils');
const { getDepartmentForHod } = require('../utils/hodUtils');

async function resolveProfile(userId) {
  const profile = await StudentProfile.findOne({ userId })
    .populate('department', 'name code')
    .lean();
  if (!profile) {
    const err = new Error('Student profile not found');
    err.status = 404;
    throw err;
  }
  return profile;
}

async function getTeacherDepartment(userId) {
  const teacher = await TeacherProfile.findOne({ userId });
  if (!teacher || !teacher.department) {
    const err = new Error('Teacher profile not assigned to a department');
    err.status = 403;
    throw err;
  }
  return teacher.department;
}

exports.getMe = async (req, res, next) => {
  try {
    const profile = await resolveProfile(req.user.userId);
    const analytics = await analyticsService.getStudentAnalytics(profile._id);
    res.json({
      profile,
      analytics: {
        performance: analytics.performance,
        riskLevel: analytics.riskLevel,
        riskDetails: analytics.riskDetails,
        attendanceSummary: analytics.attendanceSummary,
        marksSummary: analytics.marksSummary,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const profile = await resolveProfile(req.user.userId);
    const analytics = await analyticsService.getStudentAnalytics(profile._id);
    res.json({
      attendanceSummary: analytics.attendanceSummary,
      attendanceHistory: analytics.attendanceHistory,
      attendanceTrend: analytics.attendanceTrend,
      attendancePercentage: analytics.attendancePercentage,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMarks = async (req, res, next) => {
  try {
    const profile = await resolveProfile(req.user.userId);
    const analytics = await analyticsService.getStudentAnalytics(profile._id);
    res.json({
      marksSummary: analytics.marksSummary,
      marksAveragePercent: analytics.averageMarksPercent,
    });
  } catch (err) {
    next(err);
  }
};

exports.listAll = async (req, res, next) => {
  try {
    const filters = {};
    let departmentFilter = req.query.departmentId;
    if (req.user.role === 'hod') {
      const hodDepartment = await getDepartmentForHod(req.user.userId);
      departmentFilter = hodDepartment._id.toString();
    }
    if (req.user.role === 'teacher') {
      const teacherDepartment = await getTeacherDepartment(req.user.userId);
      departmentFilter = teacherDepartment.toString();
    }
    if (departmentFilter) {
      filters.department = departmentFilter;
    }
    if (req.query.semester) {
      filters.semester = Number(req.query.semester);
    }

    const search = req.query.search?.trim();
    if (search) {
      const userMatches = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
      filters.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
      if (userMatches.length) {
        filters.$or.push({ userId: { $in: userMatches.map((user) => user._id) } });
      }
    }

    const students = await StudentProfile.find(filters)
      .populate('department', 'name code')
      .populate('userId', 'email')
      .sort({ fullName: 1 });

    const studentIds = students.map((student) => student._id);

    let attendanceAgg = [];
    let marksAgg = [];
    if (studentIds.length) {
      attendanceAgg = await Attendance.aggregate([
        { $match: { studentId: { $in: studentIds } } },
        {
          $group: {
            _id: '$studentId',
            total: { $sum: 1 },
            present: {
              $sum: {
                $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
              },
            },
          },
        },
      ]);
      marksAgg = await Marks.aggregate([
        {
          $match: {
            studentId: { $in: studentIds },
            maxMarks: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: '$studentId',
            averagePercent: {
              $avg: {
                $multiply: [
                  { $divide: ['$marksObtained', '$maxMarks'] },
                  100,
                ],
              },
            },
          },
        },
      ]);
    }

    const attendanceMap = {};
    attendanceAgg.forEach((item) => {
      attendanceMap[item._id.toString()] = item.total
        ? Math.round((item.present / item.total) * 100)
        : 0;
    });

    const marksMap = {};
    marksAgg.forEach((item) => {
      marksMap[item._id?.toString()] = Math.round(item.averagePercent || 0);
    });

    const result = students.map((student) => {
      const studentObj = student.toObject();
      const key = student._id.toString();
      const attendancePercent = attendanceMap[key] ?? 0;
      const marksPercent = marksMap[key] ?? 0;
      return {
        ...studentObj,
        attendancePercentage: attendancePercent,
        marksAveragePercent: marksPercent,
        riskLevel: determineRiskLevel(attendancePercent, marksPercent),
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.id).populate('department', 'name code');
    if (!profile) return res.status(404).json({ message: 'Student profile not found' });
    if (req.user.role === 'hod') {
      const hodDepartment = await getDepartmentForHod(req.user.userId);
      if (profile.department.toString() !== hodDepartment._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    if (req.user.role === 'teacher') {
      const teacherDepartment = await getTeacherDepartment(req.user.userId);
      if (profile.department.toString() !== teacherDepartment.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
};
