const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const TeacherProfile = require('../models/TeacherProfile');
const User = require('../models/User');
const TimetableEntry = require('../models/TimetableEntry');
const { syncTeacherAssignment, ensureTeacherExists } = require('../utils/teacherAssignment');

const createTemporaryPassword = () => crypto.randomBytes(5).toString('base64').slice(0, 8);

async function populateTeacher(teacher) {
  const id = typeof teacher === 'string' ? teacher : teacher._id;
  return TeacherProfile.findById(id)
    .populate('department', 'name code')
    .populate('subjectsHandled', 'name code semester')
    .populate('userId', 'email role');
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
    const {
      fullName,
      email,
      employeeId,
      departmentId,
      subjectsAssigned = [],
      phone,
      role = 'teacher',
    } = req.body;

    const [existingEmail, existingEmployee] = await Promise.all([
      User.findOne({ email }),
      TeacherProfile.findOne({ employeeId }),
    ]);
    if (existingEmail) return res.status(409).json({ message: 'Email already registered' });
    if (existingEmployee) return res.status(409).json({ message: 'Employee ID already used' });

    const tempPassword = createTemporaryPassword();
    const password = await bcrypt.hash(tempPassword, 10);
    const user = await User.create({
      name: fullName,
      email,
      password,
      role,
      profileCompleted: true,
    });

    const teacher = await TeacherProfile.create({
      userId: user._id,
      fullName,
      employeeId,
      department: departmentId,
      subjectsHandled: [],
      phone,
    });

    await Promise.all(
      (subjectsAssigned || []).map(async (subjectId) => {
        await Subject.findByIdAndUpdate(subjectId, { assignedTeacher: teacher._id });
        await syncTeacherAssignment(subjectId, teacher._id, null);
      })
    );

    const populated = await populateTeacher(teacher);
    res.status(201).json({
      teacher: populated,
      credentials: { email: user.email, password: tempPassword },
    });
  } catch (err) {
    next(err);
  }
};

exports.listTeachers = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.departmentId) filters.department = req.query.departmentId;

    const search = req.query.search?.trim();
    let emailMatches = [];
    if (search) {
      filters.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
      emailMatches = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
      if (emailMatches.length) {
        filters.$or.push({ userId: { $in: emailMatches.map((user) => user._id) } });
      }
    }
    const teachers = await TeacherProfile.find(filters)
      .sort({ fullName: 1 })
      .populate('department', 'name code')
      .populate('subjectsHandled', 'name code semester')
      .populate('userId', 'email role');
    res.json(teachers);
  } catch (err) {
    next(err);
  }
};

exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await populateTeacher(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const user = await User.findById(teacher.userId);
    if (!user) return res.status(404).json({ message: 'Associated user missing' });

    if (req.body.email && req.body.email !== user.email) {
      const emailTaken = await User.findOne({ email: req.body.email });
      if (emailTaken) return res.status(409).json({ message: 'Email already registered' });
      user.email = req.body.email;
    }
    if (req.body.fullName) {
      teacher.fullName = req.body.fullName;
      user.name = req.body.fullName;
    }
    if (req.body.role && req.body.role !== user.role) {
      user.role = req.body.role;
    }
    if (req.body.phone !== undefined) teacher.phone = req.body.phone;
    if (req.body.employeeId && req.body.employeeId !== teacher.employeeId) {
      const empTaken = await TeacherProfile.findOne({ employeeId: req.body.employeeId, _id: { $ne: teacher._id } });
      if (empTaken) return res.status(409).json({ message: 'Employee ID already used' });
      teacher.employeeId = req.body.employeeId;
    }
    if (req.body.departmentId) {
      teacher.department = req.body.departmentId;
    }

    const prevSubjects = teacher.subjectsHandled.map((id) => id.toString());
    if (req.body.subjectsAssigned) {
      const nextSubjects = req.body.subjectsAssigned;
      const removed = prevSubjects.filter((id) => !nextSubjects.includes(id));
      const added = nextSubjects.filter((id) => !prevSubjects.includes(id));
      await Promise.all(
        removed.map(async (subjectId) => {
          const subject = await Subject.findById(subjectId);
          if (subject && subject.assignedTeacher?.toString() === teacher._id.toString()) {
            await subject.updateOne({ $unset: { assignedTeacher: '' } });
          }
          await syncTeacherAssignment(subjectId, null, teacher._id);
        })
      );
      await Promise.all(
        added.map(async (subjectId) => {
          const subject = await Subject.findById(subjectId);
          const prevTeacherId = subject?.assignedTeacher?.toString();
          if (subject) {
            subject.assignedTeacher = teacher._id;
            await subject.save();
          }
          await syncTeacherAssignment(subjectId, teacher._id, prevTeacherId);
        })
      );
      teacher.subjectsHandled = nextSubjects;
    }

    await Promise.all([teacher.save(), user.save()]);
    const populated = await populateTeacher(teacher);
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    await Subject.updateMany({ assignedTeacher: teacher._id }, { $unset: { assignedTeacher: '' } });
    await Department.updateMany({ hod: teacher.userId }, { $unset: { hod: '' } });
    await User.findByIdAndDelete(teacher.userId);
    await teacher.deleteOne();
    res.json({ message: 'Teacher removed' });
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
