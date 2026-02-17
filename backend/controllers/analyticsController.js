const { predictPerformance } = require('../ai-engine/performance');
const { detectDropoutRisk } = require('../ai-engine/dropout');
const { analyzeAttendanceTrend } = require('../ai-engine/attendance');
const { generateRecommendations } = require('../ai-engine/recommendation');

exports.predictPerformance = async (req, res, next) => {
  try {
    const result = predictPerformance(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.detectDropoutRisk = async (req, res, next) => {
  try {
    const result = detectDropoutRisk(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.analyzeAttendanceTrend = async (req, res, next) => {
  try {
    const result = analyzeAttendanceTrend(req.body.attendanceHistory);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.generateRecommendations = async (req, res, next) => {
  try {
    const result = generateRecommendations(req.body.studentData, req.body.predictions);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
