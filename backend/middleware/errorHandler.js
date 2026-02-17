// Centralized error handler middleware
module.exports = (err, req, res, _next) => {
  void _next;
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    details: err.details,
  });
};
