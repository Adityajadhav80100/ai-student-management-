const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    examName: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    marksObtained: { type: Number, required: true },
    examDate: { type: Date },
  },
  { timestamps: true }
);

marksSchema.index({ studentId: 1, subjectId: 1, examName: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
