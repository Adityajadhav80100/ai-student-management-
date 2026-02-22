const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const departmentBody = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  code: Joi.string().trim().min(2).max(20).required(),
  description: Joi.string().trim().max(300).allow('', null),
});

const departmentUpdateBody = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  code: Joi.string().trim().min(2).max(20),
  description: Joi.string().trim().max(300).allow('', null),
}).min(1);

const subjectBody = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  code: Joi.string().trim().min(2).max(20).required(),
  departmentId: objectId.required(),
  semester: Joi.number().integer().min(1).max(12).required(),
  assignedTeacherId: objectId.allow(null),
});

const subjectUpdateBody = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  code: Joi.string().trim().min(2).max(20),
  departmentId: objectId,
  semester: Joi.number().integer().min(1).max(12),
  assignedTeacherId: objectId.allow(null),
}).min(1);

const subjectQuery = Joi.object({
  departmentId: objectId.optional(),
  semester: Joi.number().integer().min(1).max(12).optional(),
});

const adminStudentQuery = Joi.object({
  departmentId: objectId.optional(),
  semester: Joi.number().integer().min(1).max(12).optional(),
  academicYear: Joi.string().trim().allow('', null).optional(),
});

const assignTeacherBody = Joi.object({
  teacherProfileId: objectId.required(),
});

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const teacherBody = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(8).required(),
  departmentId: objectId.required(),
  phone: Joi.string().trim().allow('', null),
});

const teacherUpdateBody = Joi.object({
  fullName: Joi.string().trim().min(2).max(120),
  departmentId: objectId,
  phone: Joi.string().trim().allow('', null),
  active: Joi.boolean(),
}).min(1);

const teacherQuery = Joi.object({
  departmentId: objectId.optional(),
  search: Joi.string().trim().allow('', null),
});

const teacherIdParam = Joi.object({
  id: objectId.required(),
});

const teacherIdRoute = Joi.object({
  teacherId: objectId.required(),
});

const assignSubjectsBody = Joi.object({
  subjectIds: Joi.array().items(objectId).unique().required(),
});

const timetableBody = Joi.object({
  departmentId: objectId.required(),
  semester: Joi.number().integer().min(1).max(12).required(),
  subjectId: objectId.required(),
  teacherId: objectId.required(),
  dayOfWeek: Joi.string()
    .valid(...daysOfWeek)
    .required(),
  startTime: Joi.string()
    .pattern(/^([01]\\d|2[0-3]):([0-5]\\d)$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([01]\\d|2[0-3]):([0-5]\\d)$/)
    .required(),
}).custom((value, helpers) => {
  if (value.startTime >= value.endTime) {
    return helpers.message('endTime must be after startTime');
  }
  return value;
});

const timetableQuery = Joi.object({
  departmentId: objectId.optional(),
  semester: Joi.number().integer().min(1).max(12).optional(),
});

const assignHodBody = Joi.object({
  teacherProfileId: objectId.required(),
});

module.exports = {
  departmentBody,
  departmentUpdateBody,
  subjectBody,
  subjectUpdateBody,
  subjectQuery,
  assignTeacherBody,
  teacherBody,
  teacherUpdateBody,
  teacherQuery,
  teacherIdParam,
  timetableBody,
  timetableQuery,
  assignHodBody,
  adminStudentQuery,
  teacherIdRoute,
  assignSubjectsBody,
};
