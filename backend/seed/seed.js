const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const AdminProfile = require('../models/AdminProfile');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const ClassEnrollment = require('../models/ClassEnrollment');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
require('dotenv').config({ path: './.env' });

const departmentsSeed = [
  {
    name: 'Computer Science Engineering',
    code: 'CSE',
    description: 'Core computing and algorithms',
  },
  {
    name: 'Information Technology',
    code: 'IT',
    description: 'Networks, DevOps, and application development',
  },
];

const subjectsSeed = [
  { name: 'Data Structures', code: 'CSE201', departmentCode: 'CSE', semester: 3 },
  { name: 'Algorithms', code: 'CSE301', departmentCode: 'CSE', semester: 5 },
  { name: 'Database Systems', code: 'IT202', departmentCode: 'IT', semester: 4 },
];

const usersSeed = [
  { name: 'System Admin', email: 'admin@ai-school.com', password: 'AdminPass123', role: 'admin' },
  { name: 'Priya Raman', email: 'priya@ai-school.com', password: 'TeacherPass123', role: 'teacher' },
  { name: 'Rahul Shah', email: 'rahul@ai-school.com', password: 'TeacherPass123', role: 'teacher' },
  { name: 'Meera Nair', email: 'meera@ai-school.com', password: 'StudentPass123', role: 'student' },
  { name: 'Aarav Patel', email: 'aarav@ai-school.com', password: 'StudentPass123', role: 'student' },
  { name: 'Nina Kapoor', email: 'nina@ai-school.com', password: 'StudentPass123', role: 'student' },
];

const randomStatus = () => (Math.random() < 0.85 ? 'present' : 'absent');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      TeacherProfile.deleteMany({}),
      AdminProfile.deleteMany({}),
      Department.deleteMany({}),
      Subject.deleteMany({}),
      ClassEnrollment.deleteMany({}),
      Attendance.deleteMany({}),
      Marks.deleteMany({}),
    ]);

    const departments = await Department.insertMany(departmentsSeed);
    const deptMap = departments.reduce((acc, dept) => {
      acc[dept.code] = dept;
      return acc;
    }, {});

    const hashedUsers = await Promise.all(
      usersSeed.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
        profileCompleted: true,
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    const userMap = createdUsers.reduce((acc, user) => {
      acc[user.email] = user;
      return acc;
    }, {});

    const adminUser = userMap['admin@ai-school.com'];
    const teacherUsers = [userMap['priya@ai-school.com'], userMap['rahul@ai-school.com']];
    const studentUsers = [
      userMap['meera@ai-school.com'],
      userMap['aarav@ai-school.com'],
      userMap['nina@ai-school.com'],
    ];

    await AdminProfile.create({
      userId: adminUser._id,
      name: 'System Admin',
      institutionName: 'AI Student University',
      logoUrl: '/uploads/logo.png',
    });

    const teacherProfiles = await TeacherProfile.insertMany([
      {
        userId: teacherUsers[0]._id,
        fullName: 'Priya Raman',
        employeeId: 'T-1001',
        department: deptMap['CSE']._id,
        subjectsHandled: [],
        phone: '+1-555-0110',
        photoUrl: '/uploads/priya.jpg',
      },
      {
        userId: teacherUsers[1]._id,
        fullName: 'Rahul Shah',
        employeeId: 'T-1002',
        department: deptMap['IT']._id,
        subjectsHandled: [],
        phone: '+1-555-0111',
        photoUrl: '/uploads/rahul.jpg',
      },
    ]);

    const subjectDocs = await Promise.all(
      subjectsSeed.map(async (subject) => {
        const assignedTeacher =
          subject.departmentCode === 'CSE' ? teacherProfiles[0]._id : teacherProfiles[1]._id;
        const doc = await Subject.create({
          name: subject.name,
          code: subject.code,
          department: deptMap[subject.departmentCode]._id,
          semester: subject.semester,
          assignedTeacher,
        });
        await TeacherProfile.findByIdAndUpdate(assignedTeacher, {
          $addToSet: { subjectsHandled: doc._id },
        });
        return doc;
      })
    );

    const studentProfiles = await StudentProfile.insertMany([
      {
        userId: studentUsers[0]._id,
        fullName: 'Meera Nair',
        rollNumber: 'CSE2026-001',
        department: deptMap['CSE']._id,
        semester: 4,
        phone: '+1-555-0210',
        address: '123 Engineering Lane',
        parentContact: '+1-555-0310',
        photoUrl: '/uploads/meera.jpg',
        currentCGPA: 8.2,
        section: 'A',
      },
      {
        userId: studentUsers[1]._id,
        fullName: 'Aarav Patel',
        rollNumber: 'IT2026-002',
        department: deptMap['IT']._id,
        semester: 4,
        phone: '+1-555-0220',
        address: '456 Innovation Drive',
        parentContact: '+1-555-0320',
        photoUrl: '/uploads/aarav.jpg',
        currentCGPA: 7.6,
        section: 'B',
      },
      {
        userId: studentUsers[2]._id,
        fullName: 'Nina Kapoor',
        rollNumber: 'CSE2026-003',
        department: deptMap['CSE']._id,
        semester: 3,
        phone: '+1-555-0230',
        address: '789 Research Blvd',
        parentContact: '+1-555-0330',
        photoUrl: '/uploads/nina.jpg',
        currentCGPA: 9.1,
        section: 'A',
      },
    ]);

    const enrollments = [];
    studentProfiles.forEach((studentProfile) => {
      const deptSubjects = subjectDocs.filter(
        (subject) => subject.department.toString() === studentProfile.department.toString()
      );
      deptSubjects.slice(0, 2).forEach((subject) => {
        enrollments.push({
          studentProfileId: studentProfile._id,
          subjectId: subject._id,
          academicYear: '2025-2026',
          active: true,
        });
      });
    });
    await ClassEnrollment.insertMany(enrollments);

    const attendanceRecords = [];
    const marksRecords = [];
    const baseDate = new Date(2026, 0, 10);
    studentProfiles.forEach((studentProfile, studentIndex) => {
      const studentEnrollments = enrollments.filter(
        (enrollment) => enrollment.studentProfileId.toString() === studentProfile._id.toString()
      );
      studentEnrollments.forEach((enrollment, enrollmentIndex) => {
        for (let offset = 0; offset < 5; offset += 1) {
          const date = new Date(baseDate);
          date.setDate(baseDate.getDate() + offset + studentIndex);
          attendanceRecords.push({
            studentId: studentProfile._id,
            subjectId: enrollment.subjectId,
            date,
            status: randomStatus(),
          });
        }
        ['Midterm', 'Final'].forEach((examName, examIndex) => {
          const score = 60 + Math.round(Math.random() * 35);
          marksRecords.push({
            studentId: studentProfile._id,
            subjectId: enrollment.subjectId,
            examName,
            maxMarks: 100,
            marksObtained: Math.min(100, score + enrollmentIndex * 2 - examIndex * 3),
            examDate: new Date(2026, 1, 5 + examIndex),
          });
        });
      });
    });

    await Attendance.insertMany(attendanceRecords);
    await Marks.insertMany(marksRecords);

    console.log('Seed completed with:');
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Subjects: ${subjectDocs.length}`);
    console.log(`- Teachers: ${teacherProfiles.length}`);
    console.log(`- Students: ${studentProfiles.length}`);
    console.log(`- Attendance records: ${attendanceRecords.length}`);
    console.log(`- Marks records: ${marksRecords.length}`);
    console.log('Default Logins: admin@ai-school.com / AdminPass123, priya@ai-school.com / TeacherPass123, meera@ai-school.com / StudentPass123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  }
}

seed();
