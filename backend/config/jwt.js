module.exports = {
  accessSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  accessExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret: process.env.REFRESH_SECRET || 'default_refresh_secret',
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
};
