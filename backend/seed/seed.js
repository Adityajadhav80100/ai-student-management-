// MongoDB seed script for AI Student Management System
// Run: node seed/seed.js
const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });


// Helper functions for random data
const firstNames = ['Alice', 'Bob', 'Priya', 'Rahul', 'Fatima', 'John', 'Sara', 'Amit', 'Meera', 'David', 'Lina', 'Ravi', 'Sana', 'Vikram', 'Nina', 'Karan', 'Anjali', 'Sam', 'Pooja', 'Arjun'];
const lastNames = ['Johnson', 'Smith', 'Patel', 'Mehra', 'Khan', 'Williams', 'Singh', 'Sharma', 'Brown', 'Lee', 'Gupta', 'Das', 'Roy', 'Chopra', 'Fernandes', 'Joshi', 'Verma', 'Kapoor', 'Bose', 'Reddy'];
const departments = ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical'];
const riskLevels = ['Low', 'Medium', 'High'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function generateStudents(count = 40) {
  const students = [];
  for (let i = 0; i < count; i++) {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const name = `${first} ${last}`;
    const rollNo = `CE2023${(100 + i).toString().padStart(3, '0')}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`;
    const department = pick(departments);
    const semester = randomInt(1, 8);
    const attendance = randomInt(50, 98);
    const internalMarks = randomInt(30, 95);
    const assignmentCompletion = randomInt(40, 100);
    const previousCGPA = randomFloat(5.0, 9.8, 2);
    // Risk logic: high if attendance < 65 or marks < 40, else random
    let riskLevel = 'Low';
    if (attendance < 65 || internalMarks < 40) riskLevel = 'High';
    else if (attendance < 75 || internalMarks < 55) riskLevel = 'Medium';
    students.push({
      name,
      rollNo,
      email,
      department,
      semester,
      attendance,
      internalMarks,
      assignmentCompletion,
      previousCGPA,
      riskLevel,
    });
  }
  return students;
}

const students = generateStudents(40);

const users = [
  { name: 'Admin', email: 'admin@college.com', password: 'admin123', role: 'admin' },
  { name: 'Teacher', email: 'teacher@college.com', password: 'teacher123', role: 'teacher' },
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'student123', role: 'student' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Student.deleteMany({});
    await User.deleteMany({});
    await Student.insertMany(students);

    // Hash passwords before inserting users
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );
    await User.insertMany(hashedUsers);

    console.log('Database seeded!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
