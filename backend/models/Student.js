const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  attendance: { type: Number, default: 0 },
  internalMarks: { type: Number, default: 0 },
  assignmentCompletion: { type: Number, default: 0 },
  previousCGPA: { type: Number, default: 0 },
  attendanceHistory: [{ date: String, present: Boolean }],
  marksHistory: [{ subject: String, score: Number }],
  assignments: [{ title: String, completed: Boolean }],
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
