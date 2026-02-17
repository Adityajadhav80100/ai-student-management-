const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const StudentProfile = require('../models/StudentProfile');
const ClassEnrollment = require('../models/ClassEnrollment');
const { predictPerformance } = require('../ai-engine/performance');
const { detectDropoutRisk } = require('../ai-engine/dropout');
const { analyzeAttendanceTrend } = require('../ai-engine/attendance');
const { generateRecommendations } = require('../ai-engine/recommendation');

function normalizeAttendanceRecords(records) {
  const summaryMap = {};
  let totalEntries = 0;
  let presentCount = 0;
  const history = records
    .map((record) => ({
      date: record.date.toISOString(),
      present: record.status === 'present',
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  records.forEach((record) => {
    const subject = record.subjectId;
    const key = subject?._id?.toString() ?? record.subjectId.toString();
    if (!summaryMap[key]) {
      summaryMap[key] = {
        subjectId: key,
        subjectName: subject?.name || 'Unknown Subject',
        total: 0,
        present: 0,
      };
    }
    summaryMap[key].total += 1;
    if (record.status === 'present') {
      summaryMap[key].present += 1;
      presentCount += 1;
    }
    totalEntries += 1;
  });

  const attendanceSummary = Object.values(summaryMap).map((subject) => ({
    ...subject,
    percentage: subject.total ? Math.round((subject.present / subject.total) * 100) : 0,
  }));

  const attendancePercentage = totalEntries ? Math.round((presentCount / totalEntries) * 100) : 0;

  return { attendanceSummary, attendanceHistory: history, attendancePercentage };
}

function normalizeMarksRecords(records) {
  const subjectMap = {};
  let totalPercent = 0;
  records.forEach((record) => {
    const subject = record.subjectId;
    const key = subject?._id?.toString() ?? record.subjectId.toString();
    if (!subjectMap[key]) {
      subjectMap[key] = {
        subjectId: key,
        subjectName: subject?.name || 'Unknown Subject',
        exams: [],
        totalPercent: 0,
      };
    }
    const percentage = record.maxMarks ? Math.round((record.marksObtained / record.maxMarks) * 100) : 0;
    subjectMap[key].exams.push({
      examName: record.examName,
      marksObtained: record.marksObtained,
      maxMarks: record.maxMarks,
      percentage,
      examDate: record.examDate?.toISOString(),
    });
    subjectMap[key].totalPercent += percentage;
    totalPercent += percentage;
  });

  const marksSummary = Object.values(subjectMap).map((subject) => ({
    subjectId: subject.subjectId,
    subjectName: subject.subjectName,
    exams: subject.exams,
    averagePercent: subject.exams.length ? Math.round(subject.totalPercent / subject.exams.length) : 0,
  }));

  const averageMarksPercent = records.length ? Math.round(totalPercent / records.length) : 0;

  return { marksSummary, averageMarksPercent };
}

const buildStudentMetrics = ({
  attendancePercentage,
  averageMarksPercent,
  assignmentCompletion,
  previousCGPA,
}) => ({
  attendance: attendancePercentage,
  internalMarks: averageMarksPercent,
  assignmentCompletion,
  previousCGPA,
});

exports.getStudentAnalytics = async (studentId) => {
  const profile = await StudentProfile.findById(studentId).lean();
  if (!profile) {
    throw Object.assign(new Error('Student profile not found'), { status: 404 });
  }

  const [attendanceRecords, marksRecords, enrollments] = await Promise.all([
    Attendance.find({ studentId }).populate('subjectId', 'name code').sort({ date: 1 }),
    Marks.find({ studentId }).populate('subjectId', 'name code').sort({ examDate: -1 }),
    ClassEnrollment.find({ studentProfileId: studentId }),
  ]);

  const { attendanceSummary, attendanceHistory, attendancePercentage } = normalizeAttendanceRecords(
    attendanceRecords
  );

  const { marksSummary, averageMarksPercent } = normalizeMarksRecords(marksRecords);

  const assignmentCompletion = marksRecords.length
    ? Math.min(100, Math.round((marksRecords.length / Math.max(enrollments.length, 1)) * 50))
    : 0;

  const studentData = buildStudentMetrics({
    attendancePercentage,
    averageMarksPercent,
    assignmentCompletion,
    previousCGPA: profile.currentCGPA || 0,
  });

  const performance = predictPerformance(studentData);
  const riskResult = detectDropoutRisk(studentData);
  const trend = analyzeAttendanceTrend(attendanceHistory);
  const recommendations = generateRecommendations(studentData, {
    ...performance,
    risk: riskResult.risk,
  });

  return {
    profile,
    attendanceSummary,
    attendanceHistory,
    attendanceTrend: trend,
    marksSummary,
    assignmentCompletion,
    attendancePercentage,
    averageMarksPercent,
    performance: {
      ...performance,
      passProbability: performance.passProbability ?? 0,
    },
    riskLevel: riskResult.risk,
    riskDetails: riskResult.reason,
    recommendations: recommendations.recommendations || [],
    studentData,
  };
};
