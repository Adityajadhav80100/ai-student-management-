module.exports = {
  secret: process.env.JWT_SECRET || 'default_jwt_secret',
  expiresIn: '7d',
};
