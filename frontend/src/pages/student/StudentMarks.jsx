import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function StudentMarks() {
  const [marksSummary, setMarksSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/students/marks');
        setMarksSummary(res.data.marksSummary || []);
      } catch (err) {
        setError('Failed to load marks');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const flatExams = useMemo(
    () =>
      marksSummary.flatMap((subject) =>
        (subject.exams || []).map((exam) => ({
          subjectName: subject.subjectName,
          examName: exam.examName,
          marksObtained: exam.marksObtained,
          maxMarks: exam.maxMarks,
          percentage: exam.percentage ?? 0,
          subjectId: subject.subjectId,
        }))
      ),
    [marksSummary]
  );

  const bestSubject = useMemo(() => {
    if (!marksSummary.length) return null;
    return marksSummary.reduce((best, subject) => {
      if (!subject.averagePercent) return best;
      if (!best || subject.averagePercent > best.averagePercent) return subject;
      return best;
    }, null);
  }, [marksSummary]);

  const weakSubject = useMemo(() => {
    if (!marksSummary.length) return null;
    return marksSummary.reduce((weak, subject) => {
      if (!subject.averagePercent) return weak;
      if (!weak || subject.averagePercent < weak.averagePercent) return subject;
      return weak;
    }, null);
  }, [marksSummary]);

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">My Marks</h1>
        <p className="text-gray-500 mt-1">Exam-by-exam performance with highlights.</p>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading marks...</div>
      ) : error ? (
        <div className="text-danger font-semibold">{error}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="text-xs uppercase tracking-wider text-gray-400">Best subject</div>
              <div className="text-xl font-semibold">{bestSubject?.subjectName || 'N/A'}</div>
              <div className="text-sm text-gray-500">
                {bestSubject ? `${bestSubject.averagePercent}% average` : 'Need marks to compute'}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="text-xs uppercase tracking-wider text-gray-400">Weak subject</div>
              <div className="text-xl font-semibold">{weakSubject?.subjectName || 'N/A'}</div>
              <div className="text-sm text-gray-500">
                {weakSubject ? `${weakSubject.averagePercent}% average` : 'Need marks to compute'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card">
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 px-6 py-4 border-b border-gray-100">
              Exam performance
            </div>
            {flatExams.length === 0 ? (
              <div className="p-6 text-gray-400 text-sm">No exams recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3 text-left">Exam</th>
                      <th className="px-4 py-3 text-left">Marks</th>
                      <th className="px-4 py-3 text-left">Max Marks</th>
                      <th className="px-4 py-3 text-left">Percentage</th>
                      <th className="px-4 py-3 text-left">Visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatExams.map((exam, index) => (
                      <tr key={`${exam.subjectId}-${exam.examName}-${index}`} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-semibold">{exam.subjectName}</td>
                        <td className="px-4 py-3">{exam.examName}</td>
                        <td className="px-4 py-3">{exam.marksObtained}</td>
                        <td className="px-4 py-3">{exam.maxMarks}</td>
                        <td className="px-4 py-3 font-semibold">{exam.percentage}%</td>
                        <td className="px-4 py-3">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(exam.percentage, 100)}%`,
                                background: exam.percentage > 80 ? '#06b6d4' : exam.percentage > 60 ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
