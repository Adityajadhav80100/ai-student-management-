const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const ClassEnrollment = require('../models/ClassEnrollment');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const analyticsService = require('../services/analyticsService');
const { determineRiskLevel } = require('../utils/riskUtils');
const { getDepartmentForHod } = require('../utils/hodUtils');

const teacherHasAccess = async (teacherUserId, studentProfileId) => {
  const teacher = await TeacherProfile.findOne({ userId: teacherUserId });
  if (!teacher || !teacher.subjectsHandled?.length) return false;
  const handledIds = teacher.subjectsHandled.map((id) => id.toString());
  const enrollment = await ClassEnrollment.findOne({
    studentProfileId,
    subjectId: { $in: handledIds },
    active: true,
  });
  return Boolean(enrollment);
};

exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await StudentProfile.findById(id).lean();
    if (!profile) return res.status(404).json({ message: 'Student profile not found' });

    if (req.user.role === 'student' && profile.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user.role === 'teacher') {
      const allowed = await teacherHasAccess(req.user.userId, id);
      if (!allowed) return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user.role === 'hod') {
      const department = await getDepartmentForHod(req.user.userId);
      if (!profile.department || profile.department.toString() !== department._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const analytics = await analyticsService.getStudentAnalytics(id);
    res.json(analytics);
  } catch (err) {
    next(err);
  }
};

exports.getMyAnalytics = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.userId }).lean();
    if (!profile) return res.status(404).json({ message: 'Student profile not found' });
    const analytics = await analyticsService.getStudentAnalytics(profile._id);
    res.json(analytics);
  } catch (err) {
    next(err);
  }
};

function buildMetricsMap(attendanceAgg, marksAgg) {
  const attendanceMap = {};
  attendanceAgg.forEach((item) => {
    attendanceMap[item._id.toString()] = item.total
      ? Math.round((item.present / item.total) * 100)
      : 0;
  });

  const marksMap = {};
  marksAgg.forEach((item) => {
    marksMap[item._id.toString()] = Math.round(item.averagePercent || 0);
  });

  return { attendanceMap, marksMap };
}

exports.getAdminOverview = async (req, res, next) => {
  try {
    const [studentCount, teacherCount, attendanceAgg, marksAgg] = await Promise.all([
      StudentProfile.countDocuments(),
      TeacherProfile.countDocuments(),
      Attendance.aggregate([
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
      ]),
      Marks.aggregate([
        {
          $group: {
            _id: '$studentId',
            averagePercent: {
              $avg: {
                $cond: [
                  { $gt: ['$maxMarks', 0] },
                  { $multiply: [{ $divide: ['$marksObtained', '$maxMarks'] }, 100] },
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const { attendanceMap, marksMap } = buildMetricsMap(attendanceAgg, marksAgg);
    const studentIds = new Set([...Object.keys(attendanceMap), ...Object.keys(marksMap)]);
    const metrics = Array.from(studentIds).map((studentId) => ({
      attendance: attendanceMap[studentId] ?? 0,
      marks: marksMap[studentId] ?? 0,
    }));

    const overallAttendance = metrics.length
      ? Math.round(metrics.reduce((sum, m) => sum + (m.attendance || 0), 0) / metrics.length)
      : 0;

    const highRiskCount = metrics.filter(
      (metric) => determineRiskLevel(metric.attendance, metric.marks) === 'High'
    ).length;

    res.json({
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      overallAttendance,
      highRiskStudents: highRiskCount,
    });
  } catch (err) {
    next(err);
  }
};

exports.getHodDepartmentAnalytics = async (req, res, next) => {
  try {
    const department = await getDepartmentForHod(req.user.userId);
    const [students, teacherCount] = await Promise.all([
      StudentProfile.find({ department: department._id }).select('_id'),
      TeacherProfile.countDocuments({ department: department._id }),
    ]);
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

    const { attendanceMap, marksMap } = buildMetricsMap(attendanceAgg, marksAgg);
    const metrics = studentIds.map((studentId) => {
      const key = studentId.toString();
      return {
        attendance: attendanceMap[key] ?? 0,
        marks: marksMap[key] ?? 0,
      };
    });

    const overallAttendance = metrics.length
      ? Math.round(metrics.reduce((sum, m) => sum + (m.attendance || 0), 0) / metrics.length)
      : 0;

    const highRiskCount = metrics.filter(
      (metric) => determineRiskLevel(metric.attendance, metric.marks) === 'High'
    ).length;

    res.json({
      department: {
        id: department._id,
        name: department.name,
        code: department.code,
      },
      studentCount: studentIds.length,
      teacherCount,
      overallAttendance,
      highRiskStudents: highRiskCount,
    });
  } catch (err) {
    next(err);
  }
};
