const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const studentProfileBody = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  rollNumber: Joi.string().trim().min(2).max(50).required(),
  department: objectId.required(),
  semester: Joi.number().integer().min(1).max(12).required(),
  phone: Joi.string().trim().allow('', null),
  address: Joi.string().trim().allow('', null),
  parentContact: Joi.string().trim().allow('', null),
  photoUrl: Joi.string().uri().allow('', null),
  currentCGPA: Joi.number().min(0).max(10).allow(null),
  section: Joi.string().trim().allow('', null),
})
  .rename('departmentId', 'department', { override: true, alias: true });

const teacherProfileBody = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  employeeId: Joi.string().trim().min(2).max(50).required(),
  department: objectId.required(),
  subjectsHandled: Joi.array().items(objectId).default([]),
  phone: Joi.string().trim().allow('', null),
  photoUrl: Joi.string().uri().allow('', null),
});

const adminProfileBody = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  institutionName: Joi.string().trim().min(2).max(150).required(),
  logoUrl: Joi.string().uri().allow('', null),
});

module.exports = {
  studentProfileBody,
  teacherProfileBody,
  adminProfileBody,
};

