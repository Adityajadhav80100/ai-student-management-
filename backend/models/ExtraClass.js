const mongoose = require('mongoose');

const extraClassSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherProfile', required: true },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    scheduledAt: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    reason: {
      type: String,
      enum: ['attendance', 'marks', 'both'],
      default: 'both',
    },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

extraClassSchema.index({ teacherId: 1, scheduledAt: 1 });
extraClassSchema.index({ departmentId: 1, scheduledAt: 1 });

module.exports = mongoose.model('ExtraClass', extraClassSchema);
