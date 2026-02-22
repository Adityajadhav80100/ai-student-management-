const mongoose = require('mongoose');
const ClassEnrollment = require('../models/ClassEnrollment');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');

async function enrollStudentInSemesterSubjects(studentProfileId, options = {}) {
  const session = options.session || null;
  const profileQuery = StudentProfile.findById(studentProfileId);
  if (session) profileQuery.session(session);
  const profile = await profileQuery.lean();
  if (!profile) {
    throw Object.assign(new Error('Student profile not found'), { status: 404 });
  }

  if (!profile.department || !profile.semester) {
    return [];
  }

  const subjectQuery = Subject.find({
    department: profile.department,
    semester: profile.semester,
  });
  if (session) subjectQuery.session(session);
  const subjects = await subjectQuery.lean();
  if (!subjects.length) return [];

  const existingQuery = ClassEnrollment.find({
    studentProfileId,
    subjectId: { $in: subjects.map((subject) => subject._id) },
  });
  if (session) existingQuery.session(session);
  const existing = await existingQuery.lean();
  const existingSet = new Set(existing.map((record) => record.subjectId.toString()));

  const toInsert = subjects
    .filter((subject) => !existingSet.has(subject._id.toString()))
    .map((subject) => ({
      studentProfileId,
      subjectId: subject._id,
    }));

  if (!toInsert.length) return [];

  try {
    const inserted = await ClassEnrollment.insertMany(toInsert, {
      session,
      ordered: false,
    });
    return inserted;
  } catch (err) {
    if (err.code === 11000) {
      return [];
    }
    throw err;
  }
}

async function removeStudentEnrollments(studentProfileId, options = {}) {
  const session = options.session || null;
  const query = ClassEnrollment.deleteMany({ studentProfileId });
  if (session) query.session(session);
  return query;
}

async function updateStudentSemesterEnrollment(studentProfileId, newSemester) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const profile = await StudentProfile.findById(studentProfileId).session(session);
      if (!profile) {
        throw Object.assign(new Error('Student profile not found'), { status: 404 });
      }

      await ClassEnrollment.deleteMany({ studentProfileId }).session(session);

      const subjects = await Subject.find({
        department: profile.department,
        semester: newSemester,
      })
        .session(session)
        .lean();

      if (!subjects.length) {
        return;
      }

      const enrollments = subjects.map((subject) => ({
        studentProfileId: profile._id,
        subjectId: subject._id,
      }));

      await ClassEnrollment.insertMany(enrollments, {
        session,
        ordered: false,
      });
    });
  } finally {
    session.endSession();
  }
}

module.exports = {
  enrollStudentInSemesterSubjects,
  updateStudentSemesterEnrollment,
  removeStudentEnrollments,
};
