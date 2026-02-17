const mongoose = require('mongoose');

const classEnrollmentSchema = new mongoose.Schema(
  {
    studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    academicYear: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

classEnrollmentSchema.index({ studentProfileId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('ClassEnrollment', classEnrollmentSchema);

