const mongoose = require('mongoose');

const extraClassStudentSchema = new mongoose.Schema(
  {
    extraClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExtraClass', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    attendanceStatus: {
      type: String,
      enum: ['pending', 'present', 'absent'],
      default: 'pending',
    },
    attendanceMarkedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

extraClassStudentSchema.index({ extraClassId: 1, studentId: 1 }, { unique: true });
extraClassStudentSchema.index({ studentId: 1, attendanceStatus: 1 });

module.exports = mongoose.model('ExtraClassStudent', extraClassStudentSchema);
