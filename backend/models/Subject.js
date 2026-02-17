const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true },
    assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherProfile' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);

