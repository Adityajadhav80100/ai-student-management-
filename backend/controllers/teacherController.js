const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Subject = require('../models/Subject');
const TeacherProfile = require('../models/TeacherProfile');
const ClassEnrollment = require('../models/ClassEnrollment');
const analyticsService = require('../services/analyticsService');

async function loadTeacher(userId) {
  const teacher = await TeacherProfile.findOne({ userId });
  if (!teacher) {
    const err = new Error('Teacher profile not found');
    err.status = 404;
    throw err;
  }
  return teacher;
}

async function ensureTeacherOwnsSubject(teacher, subjectId) {
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    const err = new Error('Invalid subject identifier');
    err.status = 400;
    throw err;
  }
  const subject = await Subject.findOne({
    _id: subjectId,
    assignedTeacher: teacher._id,
  }).populate('department', 'name code');
  if (!subject) {
    const err = new Error('Not assigned to this subject');
    err.status = 403;
    throw err;
  }
  return subject;
}

exports.getSubjects = async (req, res, next) => {
  try {
    const teacher = await loadTeacher(req.user.userId);
    const assignedIds = (teacher.assignedSubjects || []).map((id) => id.toString());
    if (!assignedIds.length) {
      return res.json([]);
    }
    const subjects = await Subject.find({ _id: { $in: assignedIds } }).populate('department', 'name code');
    res.json(subjects);
  } catch (err) {
    next(err);
  }
};

exports.getSubjectStudents = async (req, res, next) => {
  try {
    const teacher = await loadTeacher(req.user.userId);
    const subject = await ensureTeacherOwnsSubject(teacher, req.params.id);

    const enrollments = await ClassEnrollment.find({
      subjectId: req.params.id,
      active: true,
    })
      .populate('studentProfileId', 'fullName rollNumber department semester phone currentCGPA section userId')
      .lean();

    const attendanceDate = req.query.date ? normalizeDay(req.query.date) : null;
    const attendanceFilters = { subjectId: req.params.id };
    if (attendanceDate) attendanceFilters.date = attendanceDate;
    const attendanceRecords = attendanceDate ? await Attendance.find(attendanceFilters).lean() : [];
    const attendanceMap = attendanceRecords.reduce((acc, record) => {
      acc[record.studentId.toString()] = record.status;
      return acc;
    }, {});

    if (!enrollments.length) {
      return res.json({
        subject: {
          id: subject._id,
          name: subject.name,
          code: subject.code,
          semester: subject.semester,
        },
        students: [],
        attendanceLocked: Boolean(attendanceDate && attendanceRecords.length),
        attendanceDate: attendanceDate ? attendanceDate.toISOString().split('T')[0] : null,
      });
    }

    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const profile = enrollment.studentProfileId;
        const analytics = await analyticsService.getStudentAnalytics(profile._id);
        return {
          enrollmentId: enrollment._id,
          student: analytics.profile,
          attendanceStatus: attendanceMap[profile._id.toString()] || 'present',
          analytics: {
            riskLevel: analytics.riskLevel,
            attendancePercentage: analytics.attendancePercentage,
            marksSummary: analytics.marksSummary,
            predictedGrade: analytics.performance?.predictedGrade,
            passProbability: analytics.performance?.passProbability,
            marksAveragePercent: analytics.averageMarksPercent,
          },
        };
      })
    );

    res.json({
      subject: {
        id: subject._id,
        name: subject.name,
        code: subject.code,
        semester: subject.semester,
      },
      students,
      attendanceLocked: Boolean(attendanceDate && attendanceRecords.length),
      attendanceDate: attendanceDate ? attendanceDate.toISOString().split('T')[0] : null,
    });
  } catch (err) {
    next(err);
  }
};

function normalizeDay(dateValue) {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
}

exports.recordAttendance = async (req, res, next) => {
  try {
    const teacher = await loadTeacher(req.user.userId);
    await ensureTeacherOwnsSubject(teacher, req.body.subjectId);
    const enrollments = await ClassEnrollment.find({
      subjectId: req.body.subjectId,
      active: true,
    }).lean();
    const enrolledIds = enrollments.map((enroll) => enroll.studentProfileId.toString());

    const date = normalizeDay(req.body.date);
    const sessionExists = await Attendance.exists({ subjectId: req.body.subjectId, date });

    const ops = req.body.records.map(async (record) => {
      if (!enrolledIds.includes(record.studentId)) {
        const err = new Error('Student not enrolled in this subject');
        err.status = 400;
        throw err;
      }
      return Attendance.findOneAndUpdate(
        {
          studentId: record.studentId,
          subjectId: req.body.subjectId,
          date,
        },
        {
          status: record.status,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    });
    await Promise.all(ops);
    const message = sessionExists ? 'Attendance already submitted today. Updated records.' : 'Attendance recorded';
    const statusCode = sessionExists ? 200 : 201;
    res.status(statusCode).json({ message, alreadySubmitted: Boolean(sessionExists) });
  } catch (err) {
    next(err);
  }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const teacher = await loadTeacher(req.user.userId);
    if (req.query.subjectId) {
      await ensureTeacherOwnsSubject(teacher, req.query.subjectId);
    } else {
      const assignedList = teacher.assignedSubjects?.length
        ? teacher.assignedSubjects
        : teacher.subjectsHandled;
      if (assignedList.length === 1) {
        const item = assignedList[0];
        req.query.subjectId = item._id ? item._id : item;
      }
    }
    const filters = {};
    if (req.query.subjectId) filters.subjectId = req.query.subjectId;
    if (req.query.date) filters.date = normalizeDay(req.query.date);
    const records = await Attendance.find(filters)
      .populate('studentId', 'fullName rollNumber')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.recordMarks = async (req, res, next) => {
  try {
    const teacher = await loadTeacher(req.user.userId);
    await ensureTeacherOwnsSubject(teacher, req.body.subjectId);
    const enrollments = await ClassEnrollment.find({
      subjectId: req.body.subjectId,
      active: true,
    }).lean();
    const enrolledIds = enrollments.map((enroll) => enroll.studentProfileId.toString());

    const examExists = await Marks.exists({
      subjectId: req.body.subjectId,
      examName: req.body.examName,
    });

    const ops = req.body.records.map(async (record) => {
      if (!enrolledIds.includes(record.studentId)) {
        const err = new Error('Student not enrolled in this subject');
        err.status = 400;
        throw err;
      }
      return Marks.findOneAndUpdate(
        {
          studentId: record.studentId,
          subjectId: req.body.subjectId,
          examName: req.body.examName,
        },
        {
          marksObtained: record.marksObtained,
          maxMarks: req.body.maxMarks,
          examDate: req.body.examDate ? new Date(req.body.examDate) : new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    });
    await Promise.all(ops);
    const statusCode = examExists ? 200 : 201;
    const message = examExists ? 'Marks updated' : 'Marks recorded';
    res.status(statusCode).json({ message, alreadyRecorded: Boolean(examExists) });
  } catch (err) {
    next(err);
  }
};

exports.getMarks = async (req, res, next) => {
  try {
    const teacher = await loadTeacher(req.user.userId);
    if (req.query.subjectId) {
      await ensureTeacherOwnsSubject(teacher, req.query.subjectId);
    }
    const filters = {};
    if (req.query.subjectId) filters.subjectId = req.query.subjectId;
    if (req.query.examName) filters.examName = req.query.examName;
    const records = await Marks.find(filters)
      .populate('studentId', 'fullName rollNumber')
      .sort({ examDate: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};
