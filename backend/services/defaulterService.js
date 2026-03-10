const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const StudentProfile = require('../models/StudentProfile');
const ClassEnrollment = require('../models/ClassEnrollment');

function buildMaps(attendanceAgg, marksAgg) {
  const attendanceMap = new Map();
  attendanceAgg.forEach((item) => {
    const percentage = item.total ? Math.round((item.present / item.total) * 100) : 0;
    attendanceMap.set(item._id.toString(), percentage);
  });

  const marksMap = new Map();
  marksAgg.forEach((item) => {
    marksMap.set(item._id.toString(), Math.round(item.averagePercent || 0));
  });

  return { attendanceMap, marksMap };
}

async function aggregateStudentMetrics(studentIds) {
  if (!studentIds.length) {
    return {
      attendanceMap: new Map(),
      marksMap: new Map(),
    };
  }

  const [attendanceAgg, marksAgg] = await Promise.all([
    Attendance.aggregate([
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
    ]),
    Marks.aggregate([
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
              $multiply: [{ $divide: ['$marksObtained', '$maxMarks'] }, 100],
            },
          },
        },
      },
    ]),
  ]);

  return buildMaps(attendanceAgg, marksAgg);
}

function toStatus(profile, attendanceMap, marksMap) {
  const key = profile._id.toString();
  const attendancePercentage = attendanceMap.get(key) ?? 0;
  const marksAveragePercent = marksMap.get(key) ?? 0;
  const isDefaulter = attendancePercentage < 75 || marksAveragePercent < 40;

  return {
    ...profile,
    attendancePercentage,
    marksAveragePercent,
    isDefaulter,
    defaulterReasons: [
      ...(attendancePercentage < 75 ? ['attendance'] : []),
      ...(marksAveragePercent < 40 ? ['marks'] : []),
    ],
  };
}

async function getDefaulterStudents(filters = {}) {
  const studentFilters = {};
  if (filters.departmentId) studentFilters.department = filters.departmentId;
  if (filters.semester) studentFilters.semester = Number(filters.semester);

  let studentIdsForSubject = null;
  if (filters.subjectId) {
    const enrollments = await ClassEnrollment.find({
      subjectId: filters.subjectId,
      active: true,
    })
      .select('studentProfileId')
      .lean();
    studentIdsForSubject = enrollments.map((entry) => entry.studentProfileId);
    if (!studentIdsForSubject.length) {
      return [];
    }
    studentFilters._id = { $in: studentIdsForSubject };
  }

  const students = await StudentProfile.find(studentFilters)
    .populate('userId', 'name email')
    .populate('department', 'name code')
    .sort({ fullName: 1 })
    .lean();

  const { attendanceMap, marksMap } = await aggregateStudentMetrics(students.map((student) => student._id));

  return students
    .map((student) => toStatus(student, attendanceMap, marksMap))
    .filter((student) => student.isDefaulter);
}

async function getStudentDefaulterStatus(studentId) {
  const student = await StudentProfile.findById(studentId)
    .populate('department', 'name code')
    .populate('userId', 'name email')
    .lean();
  if (!student) return null;
  const { attendanceMap, marksMap } = await aggregateStudentMetrics([student._id]);
  return toStatus(student, attendanceMap, marksMap);
}

module.exports = {
  aggregateStudentMetrics,
  getDefaulterStudents,
  getStudentDefaulterStatus,
};
