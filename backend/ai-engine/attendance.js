// Attendance Pattern Analyzer
// Detects sudden drop or absence streak
module.exports.analyzeAttendanceTrend = (attendanceHistory = []) => {
  if (!attendanceHistory.length) return { insight: 'No attendance data' };
  let streak = 0, maxStreak = 0, drop = false;
  for (let i = 1; i < attendanceHistory.length; i++) {
    if (!attendanceHistory[i].present && attendanceHistory[i-1].present) drop = true;
    if (!attendanceHistory[i].present) streak++;
    else streak = 0;
    if (streak > maxStreak) maxStreak = streak;
  }
  let insight = '';
  if (drop) insight += 'Sudden drop detected. ';
  if (maxStreak >= 3) insight += `Continuous absence streak of ${maxStreak} days.`;
  if (!insight) insight = 'Attendance normal.';
  return { insight };
};
