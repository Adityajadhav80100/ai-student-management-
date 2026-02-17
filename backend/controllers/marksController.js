const Marks = require('../models/Marks');
const Student = require('../models/Student');

exports.addMarks = async (req, res, next) => {
  try {
    const { studentId, subject, score, assignmentCompleted, testDate } = req.body;
    if (!studentId || !subject || typeof score !== 'number') {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const marks = await Marks.create({ student: studentId, subject, score, assignmentCompleted, testDate });
    // Update student's marks history and internal marks
    const student = await Student.findById(studentId);
    if (student) {
      student.marksHistory.push({ subject, score });
      // Average internal marks
      const total = student.marksHistory.length;
      const sum = student.marksHistory.reduce((acc, m) => acc + m.score, 0);
      student.internalMarks = Math.round(sum / total);
      // Assignment completion %
      if (typeof assignmentCompleted === 'boolean') {
        student.assignments.push({ title: subject, completed: assignmentCompleted });
        const completed = student.assignments.filter(a => a.completed).length;
        student.assignmentCompletion = Math.round((completed / student.assignments.length) * 100);
      }
      await student.save();
    }
    res.status(201).json(marks);
  } catch (err) {
    next(err);
  }
};

exports.getMarksByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const records = await Marks.find({ student: studentId });
    res.json(records);
  } catch (err) {
    next(err);
  }
};
