const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const registerBody = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('student', 'teacher', 'admin', 'hod').required(),
  department: Joi.when('role', {
    is: Joi.valid('student', 'hod'),
    then: objectId.required(),
    otherwise: objectId.optional(),
  }),
  semester: Joi.when('role', {
    is: 'student',
    then: Joi.number().integer().min(1).max(12).required(),
    otherwise: Joi.forbidden(),
  }),
});

const loginBody = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

module.exports = {
  registerBody,
  loginBody,
};

