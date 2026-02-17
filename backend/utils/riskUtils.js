function determineRiskLevel(attendancePercent = 0, marksPercent = 0) {
  if ((attendancePercent < 60 && marksPercent < 40) || (attendancePercent < 75 && marksPercent < 50)) {
    return 'High';
  }
  if (attendancePercent < 80 || marksPercent < 60) {
    return 'Medium';
  }
  return 'Low';
}

module.exports = {
  determineRiskLevel,
};
