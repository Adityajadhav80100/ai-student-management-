const Student = require('../models/Student');
const User = require('../models/User');

exports.getMe = async (req, res, next) => {
  try {
    // Prefer email in JWT (newer tokens), fallback to lookup by user id.
    let email = req.user?.email;
    if (!email && req.user?.id) {
      const user = await User.findById(req.user.id).select('email');
      email = user?.email;
    }
    if (!email) return res.status(400).json({ message: 'Unable to resolve current user email' });

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: 'Student profile not found for this account' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  // Avoid "me" being treated as ObjectId when route order mis-matches
  if (req.params.id === 'me') {
    return exports.getMe(req, res, next);
  }
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
};
