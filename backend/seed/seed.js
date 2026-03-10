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
const ExtraClass = require('../models/ExtraClass');
const ExtraClassStudent = require('../models/ExtraClassStudent');
const Notification = require('../models/Notification');
require('dotenv').config({ path: './.env' });

const departmentsSeed = [
  { name: 'Computer Science Engineering', code: 'CSE', description: 'Core computing and algorithms' },
  { name: 'Information Technology', code: 'IT', description: 'Networks, DevOps, and application development' },
];

const subjectsSeed = [
  { name: 'Data Structures', code: 'CSE201', departmentCode: 'CSE', semester: 3 },
  { name: 'Algorithms', code: 'CSE301', departmentCode: 'CSE', semester: 5 },
  { name: 'Operating Systems', code: 'CSE302', departmentCode: 'CSE', semester: 5 },
  { name: 'Database Systems', code: 'IT202', departmentCode: 'IT', semester: 4 },
  { name: 'Computer Networks', code: 'IT301', departmentCode: 'IT', semester: 5 },
  { name: 'Cloud Computing', code: 'IT302', departmentCode: 'IT', semester: 6 },
];

const baseUsers = [
  { name: 'System Admin', email: 'admin@ai-school.com', password: 'AdminPass123', role: 'admin' },
  { name: 'Priya Raman', email: 'priya@ai-school.com', password: 'TeacherPass123', role: 'teacher' },
  { name: 'Rahul Shah', email: 'rahul@ai-school.com', password: 'TeacherPass123', role: 'teacher' },
  { name: 'Meera Nair', email: 'meera@ai-school.com', password: 'StudentPass123', role: 'student' },
];

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Kavya', 'Anaya', 'Ishita', 'Rohan', 'Neha', 'Tanvi', 'Arjun',
  'Diya', 'Reyansh', 'Saanvi', 'Nikhil', 'Aisha', 'Krish', 'Pooja', 'Riya', 'Siddharth', 'Maya',
  'Nandini', 'Yash', 'Harsh', 'Sneha', 'Ira', 'Dev', 'Kiran', 'Tara', 'Om', 'Parth',
];
const lastNames = [
  'Patel', 'Sharma', 'Kulkarni', 'Reddy', 'Joshi', 'Singh', 'Kapoor', 'Menon', 'Desai', 'Verma',
  'Jadhav', 'Naik', 'Pillai', 'Chopra', 'Saxena', 'Malhotra', 'Bose', 'Kohli', 'Mishra', 'Gupta',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr, idx) {
  return arr[idx % arr.length];
}

function buildStudentSeeds() {
  const generated = [];
  for (let index = 0; index < 30; index += 1) {
    const first = pick(firstNames, index);
    const last = pick(lastNames, index * 3);
    const departmentCode = index % 2 === 0 ? 'CSE' : 'IT';
    const semesterOptions = departmentCode === 'CSE' ? [3, 5] : [4, 5, 6];
    const semester = pick(semesterOptions, index);
    generated.push({
      name: `${first} ${last}`,
      email: `student${String(index + 1).padStart(2, '0')}@ai-school.com`,
      password: 'StudentPass123',
      role: 'student',
      profile: {
        fullName: `${first} ${last}`,
        rollNumber: `${departmentCode}2026-${String(index + 1).padStart(3, '0')}`,
        departmentCode,
        semester,
        phone: `+1-555-${String(2100 + index).padStart(4, '0')}`,
        address: `${100 + index} Campus Avenue`,
        parentContact: `+1-555-${String(3100 + index).padStart(4, '0')}`,
        currentCGPA: Number((6 + Math.random() * 3.5).toFixed(1)),
        section: ['A', 'B', 'C'][index % 3],
      },
    });
  }

  generated[0].name = 'Meera Nair';
  generated[0].email = 'meera@ai-school.com';
  generated[0].profile.fullName = 'Meera Nair';
  generated[0].profile.rollNumber = 'CSE2026-001';

  return generated;
}

function randomAttendanceStatus(targetPercent) {
  return Math.random() * 100 < targetPercent ? 'present' : 'absent';
}

function buildPerformanceBand(index) {
  if (index % 7 === 0) return { attendance: randomInt(52, 70), marks: randomInt(24, 38) };
  if (index % 5 === 0) return { attendance: randomInt(58, 72), marks: randomInt(42, 68) };
  if (index % 4 === 0) return { attendance: randomInt(78, 94), marks: randomInt(30, 39) };
  return { attendance: randomInt(78, 97), marks: randomInt(55, 92) };
}

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
      ExtraClass.deleteMany({}),
      ExtraClassStudent.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const departments = await Department.insertMany(departmentsSeed);
    const deptMap = departments.reduce((acc, dept) => {
      acc[dept.code] = dept;
      return acc;
    }, {});

    const generatedStudents = buildStudentSeeds();
    const allUsersSeed = [
      ...baseUsers,
      { name: 'Anita Verma', email: 'anita@ai-school.com', password: 'TeacherPass123', role: 'teacher' },
      { name: 'Karan Mehta', email: 'karan@ai-school.com', password: 'TeacherPass123', role: 'teacher' },
      ...generatedStudents.slice(1).map((student) => ({
        name: student.name,
        email: student.email,
        password: student.password,
        role: student.role,
      })),
    ];

    const hashedUsers = await Promise.all(
      allUsersSeed.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
        profileCompleted: true,
        active: true,
        status: 'active',
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    const userMap = createdUsers.reduce((acc, user) => {
      acc[user.email] = user;
      return acc;
    }, {});

    await AdminProfile.create({
      userId: userMap['admin@ai-school.com']._id,
      name: 'System Admin',
      institutionName: 'AI Student University',
      logoUrl: '/uploads/logo.png',
    });

    const teacherProfiles = await TeacherProfile.insertMany([
      {
        userId: userMap['priya@ai-school.com']._id,
        fullName: 'Priya Raman',
        employeeId: 'T-1001',
        department: deptMap.CSE._id,
        subjectsHandled: [],
        assignedSubjects: [],
        phone: '+1-555-0110',
        photoUrl: '/uploads/priya.jpg',
      },
      {
        userId: userMap['rahul@ai-school.com']._id,
        fullName: 'Rahul Shah',
        employeeId: 'T-1002',
        department: deptMap.IT._id,
        subjectsHandled: [],
        assignedSubjects: [],
        phone: '+1-555-0111',
        photoUrl: '/uploads/rahul.jpg',
      },
      {
        userId: userMap['anita@ai-school.com']._id,
        fullName: 'Anita Verma',
        employeeId: 'T-1003',
        department: deptMap.CSE._id,
        subjectsHandled: [],
        assignedSubjects: [],
        phone: '+1-555-0112',
      },
      {
        userId: userMap['karan@ai-school.com']._id,
        fullName: 'Karan Mehta',
        employeeId: 'T-1004',
        department: deptMap.IT._id,
        subjectsHandled: [],
        assignedSubjects: [],
        phone: '+1-555-0113',
      },
    ]);

    const teacherByDepartment = {
      CSE: teacherProfiles.filter((teacher) => teacher.department.toString() === deptMap.CSE._id.toString()),
      IT: teacherProfiles.filter((teacher) => teacher.department.toString() === deptMap.IT._id.toString()),
    };

    const subjectDocs = [];
    for (let index = 0; index < subjectsSeed.length; index += 1) {
      const subject = subjectsSeed[index];
      const teacherOptions = teacherByDepartment[subject.departmentCode];
      const assignedTeacher = teacherOptions[index % teacherOptions.length];
      const doc = await Subject.create({
        name: subject.name,
        code: subject.code,
        department: deptMap[subject.departmentCode]._id,
        semester: subject.semester,
        assignedTeacher: assignedTeacher._id,
      });
      subjectDocs.push(doc);
      await TeacherProfile.findByIdAndUpdate(assignedTeacher._id, {
        $addToSet: {
          subjectsHandled: doc._id,
          assignedSubjects: doc._id,
        },
      });
    }

    const studentProfiles = [];
    for (let index = 0; index < generatedStudents.length; index += 1) {
      const student = generatedStudents[index];
      const profile = await StudentProfile.create({
        userId: userMap[student.email]._id,
        fullName: student.profile.fullName,
        rollNumber: student.profile.rollNumber,
        department: deptMap[student.profile.departmentCode]._id,
        semester: student.profile.semester,
        phone: student.profile.phone,
        address: student.profile.address,
        parentContact: student.profile.parentContact,
        currentCGPA: student.profile.currentCGPA,
        section: student.profile.section,
      });
      studentProfiles.push(profile);
    }

    const enrollments = [];
    studentProfiles.forEach((studentProfile) => {
      const eligibleSubjects = subjectDocs.filter(
        (subject) =>
          subject.department.toString() === studentProfile.department.toString() &&
          subject.semester === studentProfile.semester
      );
      eligibleSubjects.forEach((subject) => {
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
    const baseDate = new Date(2026, 0, 6);

    studentProfiles.forEach((studentProfile, index) => {
      const studentEnrollments = enrollments.filter(
        (enrollment) => enrollment.studentProfileId.toString() === studentProfile._id.toString()
      );
      const band = buildPerformanceBand(index);

      studentEnrollments.forEach((enrollment, enrollmentIndex) => {
        for (let offset = 0; offset < 14; offset += 1) {
          const date = new Date(baseDate);
          date.setDate(baseDate.getDate() + offset * 2 + enrollmentIndex);
          attendanceRecords.push({
            studentId: studentProfile._id,
            subjectId: enrollment.subjectId,
            date,
            status: randomAttendanceStatus(band.attendance),
          });
        }

        ['Quiz 1', 'Midterm', 'Quiz 2', 'Final'].forEach((examName, examIndex) => {
          const variance = randomInt(-8, 8);
          const marksObtained = Math.max(10, Math.min(98, band.marks + variance + examIndex * 2));
          marksRecords.push({
            studentId: studentProfile._id,
            subjectId: enrollment.subjectId,
            examName,
            maxMarks: 100,
            marksObtained,
            examDate: new Date(2026, 0, 20 + examIndex * 10),
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
    console.log(`- Enrollments: ${enrollments.length}`);
    console.log(`- Attendance records: ${attendanceRecords.length}`);
    console.log(`- Marks records: ${marksRecords.length}`);
    console.log('Default logins: admin@ai-school.com / AdminPass123, priya@ai-school.com / TeacherPass123, meera@ai-school.com / StudentPass123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  }
}

seed();
