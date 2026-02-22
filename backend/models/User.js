const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
    enum: ['student', 'teacher', 'admin', 'hod'],
      required: true,
    },
    profileCompleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
