const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const TeacherProfile = require('../models/TeacherProfile');
const User = require('../models/User');
const TimetableEntry = require('../models/TimetableEntry');
const StudentProfile = require('../models/StudentProfile');
const ClassEnrollment = require('../models/ClassEnrollment');
const { syncTeacherAssignment, ensureTeacherExists } = require('../utils/teacherAssignment');

const EMPLOYEE_PREFIX = 'TCH-';

async function generateEmployeeId() {
  while (true) {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const candidate = `${EMPLOYEE_PREFIX}${suffix}`;
    const exists = await TeacherProfile.exists({ employeeId: candidate });
    if (!exists) {
      return candidate;
    }
  }
}

async function buildTeacherResponse(teacherId) {
  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return null;
  }
  return TeacherProfile.findById(teacherId)
    .populate('department', 'name code')
    .populate('userId', 'email role active status')
    .populate({
      path: 'assignedSubjects',
      select: 'name code semester department',
      populate: {
        path: 'department',
        select: 'name code',
      },
    })
    .lean();
}

exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
};

exports.listDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort('name').populate('hod', 'name email role');
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('hod', 'name email role');
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (err) {
    next(err);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    if (req.body.assignedTeacherId) {
      await ensureTeacherExists(req.body.assignedTeacherId);
    }
    const payload = {
      name: req.body.name,
      code: req.body.code,
      department: req.body.departmentId,
      semester: req.body.semester,
      assignedTeacher: req.body.assignedTeacherId || null,
    };
    const subject = await Subject.create(payload);
    if (req.body.assignedTeacherId) {
      await syncTeacherAssignment(subject._id, req.body.assignedTeacherId, null);
    }
    const populated = await Subject.findById(subject._id).populate('department assignedTeacher', 'name code fullName');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.listSubjects = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.departmentId) filters.department = req.query.departmentId;
    if (req.query.semester) filters.semester = Number(req.query.semester);
    const subjects = await Subject.find(filters).populate('department assignedTeacher', 'name code fullName');
    res.json(subjects);
  } catch (err) {
    next(err);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const prevTeacherId = subject.assignedTeacher?.toString();
    if (req.body.assignedTeacherId !== undefined) {
      if (req.body.assignedTeacherId) {
        await ensureTeacherExists(req.body.assignedTeacherId);
      }
      subject.assignedTeacher = req.body.assignedTeacherId || null;
    }
    if (req.body.name) subject.name = req.body.name;
    if (req.body.code) subject.code = req.body.code;
    if (req.body.departmentId) subject.department = req.body.departmentId;
    if (req.body.semester) subject.semester = req.body.semester;
    await subject.save();
    await syncTeacherAssignment(subject._id, subject.assignedTeacher?.toString(), prevTeacherId);
    const updated = await Subject.findById(subject._id).populate('department assignedTeacher', 'name code fullName');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.assignTeacher = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    await ensureTeacherExists(req.body.teacherProfileId);
    const prevTeacherId = subject.assignedTeacher?.toString();
    subject.assignedTeacher = req.body.teacherProfileId;
    await subject.save();
    await syncTeacherAssignment(subject._id, req.body.teacherProfileId, prevTeacherId);
    const updated = await Subject.findById(subject._id).populate('department assignedTeacher', 'name code fullName');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.createTeacher = async (req, res, next) => {
  try {
    const { fullName, email, password, departmentId, phone } = req.body;
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid department selected' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(400).json({ message: 'Selected department does not exist' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: fullName,
      email,
      password: hashed,
      role: 'teacher',
      profileCompleted: true,
      active: true,
      status: 'active',
    });

    const teacher = await TeacherProfile.create({
      userId: user._id,
      fullName,
      department: department._id,
      phone,
      active: true,
      employeeId: await generateEmployeeId(),
    });

    const populated = await buildTeacherResponse(teacher._id);
    res.status(201).json({ teacher: populated });
  } catch (err) {
    next(err);
  }
};

exports.listTeachers = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.departmentId) filters.department = req.query.departmentId;
    const teachers = await TeacherProfile.find(filters)
      .populate('userId', 'email role active status')
      .populate('department', 'name code')
      .populate({
        path: 'assignedSubjects',
        select: 'name code semester department',
        populate: { path: 'department', select: 'name code' },
      })
      .sort({ fullName: 1 })
      .lean();
    res.json({ total: teachers.length, teachers });
  } catch (err) {
    next(err);
  }
};

exports.listStudents = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.departmentId) filters.department = req.query.departmentId;
    if (req.query.semester) filters.semester = Number(req.query.semester);

    let studentFilter = { ...filters };
    if (req.query.academicYear) {
      const year = req.query.academicYear.trim();
      if (!year) {
        return res.json({ total: 0, students: [] });
      }
      const enrollments = await ClassEnrollment.find({ academicYear: year }).select('studentProfileId').lean();
      const ids = Array.from(
        new Set(enrollments.map((item) => item.studentProfileId?.toString()).filter(Boolean))
      );
      if (!ids.length) {
        return res.json({ total: 0, students: [] });
      }
      studentFilter = { ...studentFilter, _id: { $in: ids } };
    }

    const students = await StudentProfile.find(studentFilter)
      .populate('userId', 'name email')
      .populate('department', 'name code')
      .lean();

    res.json({ total: students.length, students });
  } catch (err) {
    next(err);
  }
};

exports.getTeacher = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid teacher identifier' });
    }
    const teacher = await buildTeacherResponse(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ teacher });
  } catch (err) {
    next(err);
  }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const teacherId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher identifier' });
    }
    const teacher = await TeacherProfile.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    if (req.body.fullName) {
      teacher.fullName = req.body.fullName;
    }
    if (req.body.phone !== undefined) {
      teacher.phone = req.body.phone;
    }
    if (req.body.departmentId) {
      if (!mongoose.Types.ObjectId.isValid(req.body.departmentId)) {
        return res.status(400).json({ message: 'Invalid department selected' });
      }
      const department = await Department.findById(req.body.departmentId);
      if (!department) {
        return res.status(400).json({ message: 'Selected department does not exist' });
      }
      teacher.department = department._id;
    }
    if (typeof req.body.active === 'boolean') {
      teacher.active = req.body.active;
    }

    await teacher.save();
    if (teacher.userId) {
      await User.findByIdAndUpdate(teacher.userId, {
        active: teacher.active,
        status: teacher.active ? 'active' : 'disabled',
      });
    }

    const populated = await buildTeacherResponse(teacher._id);
    res.json({ teacher: populated });
  } catch (err) {
    next(err);
  }
};

exports.assignSubjectsToTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher identifier' });
    }
    const subjectIds = req.body.subjectIds || [];
    const normalizedIds = Array.from(
      new Set(
        subjectIds
          .map((id) => (typeof id === 'string' ? id.trim() : id))
          .filter(Boolean)
      )
    );
    if (normalizedIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: 'All subjectIds must be valid ObjectIds' });
    }
    const teacher = await TeacherProfile.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    if (!teacher.department) {
      return res.status(400).json({ message: 'Teacher is not assigned to any department' });
    }

    let subjects = [];
    if (normalizedIds.length) {
      subjects = await Subject.find({ _id: { $in: normalizedIds } });
      if (subjects.length !== normalizedIds.length) {
        return res.status(404).json({ message: 'One or more subjects not found' });
      }
    const invalidSubject = subjects.find(
      (subject) => subject.department?.toString() !== teacher.department?.toString()
    );
    if (invalidSubject) {
      return res.status(400).json({
        message: 'Cannot assign subjects from different department',
      });
    }
    }

    const previousIds = (teacher.assignedSubjects || []).map((id) => id.toString());
    const toAssign = normalizedIds.filter((id) => !previousIds.includes(id));
    const toRemove = previousIds.filter((id) => !normalizedIds.includes(id));
    const subjectMap = new Map(subjects.map((subject) => [subject._id.toString(), subject]));

    await Promise.all(
      toAssign.map(async (subjectId) => {
        const doc = subjectMap.get(subjectId);
        const prevTeacherId = doc?.assignedTeacher?.toString() || null;
        await Subject.findByIdAndUpdate(subjectId, { assignedTeacher: teacher._id });
        await syncTeacherAssignment(subjectId, teacher._id.toString(), prevTeacherId);
      })
    );

    await Promise.all(
      toRemove.map(async (subjectId) => {
        await Subject.findByIdAndUpdate(subjectId, { $unset: { assignedTeacher: '' } });
        await syncTeacherAssignment(subjectId, null, teacher._id.toString());
      })
    );

    teacher.assignedSubjects = normalizedIds;
    teacher.subjectsHandled = normalizedIds;
    await teacher.save();

    const updatedTeacher = await buildTeacherResponse(teacherId);
    res.json({
      message: 'Subjects assigned successfully',
      teacher: updatedTeacher,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid teacher identifier' });
    }
    const teacher = await TeacherProfile.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    teacher.active = false;
    await teacher.save();
    if (teacher.userId) {
      await User.findByIdAndUpdate(teacher.userId, { active: false, status: 'disabled' });
    }
    res.json({ message: 'Teacher deactivated' });
  } catch (err) {
    next(err);
  }
};

exports.createTimetableEntry = async (req, res, next) => {
  try {
    const entry = await TimetableEntry.create(req.body);
    const populated = await TimetableEntry.findById(entry._id)
      .populate('departmentId', 'name code')
      .populate('subjectId', 'name code semester')
      .populate('teacherId', 'fullName employeeId');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.listTimetableEntries = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.departmentId) filters.departmentId = req.query.departmentId;
    if (req.query.semester) filters.semester = Number(req.query.semester);
    const entries = await TimetableEntry.find(filters)
      .sort({ dayOfWeek: 1, startTime: 1 })
      .populate('departmentId', 'name code')
      .populate('subjectId', 'name code semester')
      .populate('teacherId', 'fullName employeeId');
    res.json(entries);
  } catch (err) {
    next(err);
  }
};

exports.deleteTimetableEntry = async (req, res, next) => {
  try {
    const entry = await TimetableEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Timetable entry removed' });
  } catch (err) {
    next(err);
  }
};

exports.assignHod = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    const teacher = await TeacherProfile.findById(req.body.teacherProfileId);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
    const user = await User.findById(teacher.userId);
    if (!user) return res.status(404).json({ message: 'Associated user missing' });

    if (department.hod && department.hod.toString() !== user._id.toString()) {
      await User.findByIdAndUpdate(department.hod, { role: 'teacher' });
    }

    user.role = 'hod';
    await user.save();
    department.hod = user._id;
    await department.save();
    const populated = await Department.findById(department._id).populate('hod', 'name email role');
    res.json({ message: 'HOD assigned', department: populated });
  } catch (err) {
    next(err);
  }
};
