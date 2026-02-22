const User = require('../models/User');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { accessSecret, accessExpiresIn, refreshSecret, refreshExpiresIn } = require('../config/jwt');

const REFRESH_COOKIE_NAME = 'refreshToken';

const parseDurationToMs = (value) => {
  if (!value) return undefined;
  const match = /^(\d+)([smhd])$/i.exec(value);
  if (!match) return undefined;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * (multipliers[unit] || 1);
};

const buildTokens = (user) => {
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn });
  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: parseDurationToMs(refreshExpiresIn) || 7 * 24 * 60 * 60 * 1000,
};

const normalizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileCompleted: user.profileCompleted,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      profileCompleted: false,
      active: true,
    });
    if (role === 'hod') {
      const departmentId = req.body.department;
      if (!departmentId) {
        return res.status(400).json({ message: 'Department is required for HOD accounts' });
      }
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(400).json({ message: 'Selected department does not exist' });
      }
      if (department.hod) {
        await User.findByIdAndUpdate(department.hod, { role: 'teacher' });
      }
      department.hod = user._id;
      await department.save();
    }
    const { accessToken, refreshToken } = buildTokens(user);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
    res.status(201).json({
      accessToken,
      user: normalizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.active === false || user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const { accessToken, refreshToken } = buildTokens(user);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
    res.json({
      accessToken,
      user: normalizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });
    const decoded = jwt.verify(token, refreshSecret);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.active === false || user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    const { accessToken, refreshToken } = buildTokens(user);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
    res.json({
      accessToken,
      user: normalizeUser(user),
    });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ success: true });
};
