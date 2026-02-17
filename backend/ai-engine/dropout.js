// Dropout Risk Detector
// Returns risk level and reason
module.exports.detectDropoutRisk = (studentData) => {
  const attendance = studentData.attendance || 0;
  const marks = studentData.internalMarks || 0;
  const assignments = studentData.assignmentCompletion || 0;
  if (attendance < 60 && marks < 40 && assignments < 50) {
    return { risk: 'High', reason: 'Low attendance, marks, and assignments' };
  } else if (attendance < 75 || marks < 50) {
    return { risk: 'Medium', reason: 'Below average attendance or marks' };
  } else {
    return { risk: 'Low', reason: 'No significant risk factors' };
  }
};
