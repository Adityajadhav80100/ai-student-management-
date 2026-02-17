const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.addAttendance = async (req, res, next) => {
  try {
    const { studentId, date, present } = req.body;
    if (!studentId || !date || typeof present !== 'boolean') {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const attendance = await Attendance.create({ student: studentId, date, present });
    // Update student's attendance history and %
    const student = await Student.findById(studentId);
    if (student) {
      student.attendanceHistory.push({ date, present });
      const total = student.attendanceHistory.length;
      const presentCount = student.attendanceHistory.filter(a => a.present).length;
      student.attendance = Math.round((presentCount / total) * 100);
      await student.save();
    }
    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ student: studentId });
    res.json(records);
  } catch (err) {
    next(err);
  }
};
