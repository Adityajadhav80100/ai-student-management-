// Performance Prediction Engine
// Calculates predicted grade and pass probability
module.exports.predictPerformance = (studentData) => {
  // Weighted formula
  const attendanceW = 0.3;
  const marksW = 0.4;
  const assignmentsW = 0.2;
  const cgpaW = 0.1;
  const attendance = studentData.attendance || 0;
  const marks = studentData.internalMarks || 0;
  const assignments = studentData.assignmentCompletion || 0;
  const cgpa = studentData.previousCGPA || 0;
  // Normalize to 100
  const score = attendance * attendanceW + marks * marksW + assignments * assignmentsW + (cgpa * 10) * cgpaW;
  let grade = 'Fail', passProb = 0;
  if (score >= 85) { grade = 'A'; passProb = 95; }
  else if (score >= 70) { grade = 'B'; passProb = 80; }
  else if (score >= 50) { grade = 'C'; passProb = 60; }
  else { grade = 'Fail'; passProb = 30; }
  return { predictedGrade: grade, passProbability: passProb };
};
