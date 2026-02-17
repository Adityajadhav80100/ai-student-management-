// AI Recommendation Engine
// Suggests interventions based on risk and prediction
module.exports.generateRecommendations = (studentData, predictions) => {
  const recs = [];
  if (predictions.risk === 'High' || predictions.predictedGrade === 'Fail') {
    recs.push('Needs counseling', 'Assign mentor', 'Recommend remedial classes');
  } else if (predictions.risk === 'Medium' || predictions.predictedGrade === 'C') {
    recs.push('Monitor progress', 'Suggest extra assignments');
  } else {
    recs.push('Keep up the good work');
  }
  return { recommendations: recs };
};
