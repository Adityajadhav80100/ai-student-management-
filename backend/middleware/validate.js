const Joi = require('joi');

// Generic request validation middleware using Joi schemas
// Usage: validate({ body: bodySchema, params: paramsSchema, query: querySchema })
module.exports = (schemas) => {
  return (req, res, next) => {
    try {
      const toValidate = ['body', 'params', 'query'];

      for (const key of toValidate) {
        if (schemas[key]) {
          const { error, value } = schemas[key].validate(req[key], {
            abortEarly: false,
            stripUnknown: true,
          });
          if (error) {
            return res.status(400).json({
              message: 'Validation error',
              details: error.details.map((d) => ({
                message: d.message,
                path: d.path,
              })),
            });
          }
          req[key] = value;
        }
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};

