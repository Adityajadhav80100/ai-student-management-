const TeacherProfile = require('../models/TeacherProfile');

async function syncTeacherAssignment(subjectId, newTeacherId, prevTeacherId) {
  if (prevTeacherId && prevTeacherId !== newTeacherId) {
    await TeacherProfile.findByIdAndUpdate(prevTeacherId, {
      $pull: { subjectsHandled: subjectId, assignedSubjects: subjectId },
    });
  }
  if (!newTeacherId) return;
  await TeacherProfile.findByIdAndUpdate(newTeacherId, {
    $addToSet: { subjectsHandled: subjectId, assignedSubjects: subjectId },
  });
}

async function ensureTeacherExists(teacherId) {
  if (!teacherId) return null;
  const teacher = await TeacherProfile.findById(teacherId);
  if (!teacher) {
    const err = new Error('Teacher profile not found');
    err.status = 404;
    throw err;
  }
  return teacher;
}

module.exports = {
  syncTeacherAssignment,
  ensureTeacherExists,
};
