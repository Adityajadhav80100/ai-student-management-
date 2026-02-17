const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const attendanceRecord = Joi.object({
  studentId: objectId.required(),
  status: Joi.string().valid('present', 'absent').required(),
});

const teacherAttendanceBody = Joi.object({
  subjectId: objectId.required(),
  date: Joi.date().required(),
  records: Joi.array().items(attendanceRecord).min(1).required(),
});

const marksRecord = Joi.object({
  studentId: objectId.required(),
  marksObtained: Joi.number().min(0).required(),
});

const teacherMarksBody = Joi.object({
  subjectId: objectId.required(),
  examName: Joi.string().trim().min(2).max(100).required(),
  maxMarks: Joi.number().min(1).required(),
  examDate: Joi.date().optional(),
  records: Joi.array().items(marksRecord).min(1).required(),
});

const attendanceQuery = Joi.object({
  subjectId: objectId.optional(),
  date: Joi.date().optional(),
});

const marksQuery = Joi.object({
  subjectId: objectId.optional(),
  examName: Joi.string().trim().min(2).max(100).optional(),
});

module.exports = {
  teacherAttendanceBody,
  teacherMarksBody,
  attendanceQuery,
  marksQuery,
};
