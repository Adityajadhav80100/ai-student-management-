import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function StudentAttendance() {
  const [summary, setSummary] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/students/attendance');
        setSummary(res.data.attendanceSummary || []);
        setHistory(res.data.attendanceHistory || []);
      } catch (err) {
        setError('Unable to fetch attendance');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const overallStats = useMemo(() => {
    if (!summary.length) return { attended: 0, total: 0 };
    const attended = summary.reduce((sum, item) => sum + (item.present ?? 0), 0);
    const total = summary.reduce((sum, item) => sum + (item.total ?? 0), 0);
    return { attended, total };
  }, [summary]);

  const attendanceRows = useMemo(() => {
    return summary.map((subject) => ({
      ...subject,
      percentage: subject.percentage ?? 0,
    }));
  }, [summary]);

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">My Attendance</h1>
        <p className="text-gray-500 mt-1">Subject-wise breakdown with live progress.</p>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading attendance...</div>
      ) : error ? (
        <div className="text-danger font-semibold">{error}</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Overall attendance</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {overallStats.attended}/{overallStats.total} classes
                </p>
              </div>
              <div className="text-sm text-gray-600">
                {overallStats.total
                  ? `${Math.round((overallStats.attended / overallStats.total) * 100)}%`
                  : 'No data yet'}
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                  width: overallStats.total ? `${Math.round((overallStats.attended / overallStats.total) * 100)}%` : '0%',
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card">
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-400 px-6 py-4 border-b border-gray-100">
              Subject-wise attendance
            </div>
            {attendanceRows.length === 0 ? (
              <div className="p-6 text-gray-400 text-sm">No attendance records yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3 text-left">Classes Attended</th>
                      <th className="px-4 py-3 text-left">Total Classes</th>
                      <th className="px-4 py-3 text-left">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRows.map((subject) => (
                      <tr key={subject.subjectId} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <div className="font-semibold">{subject.subjectName}</div>
                          <div className="text-xs text-gray-400">
                            Subject ID {subject.subjectId || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">{subject.present ?? 0}</td>
                        <td className="px-4 py-3">{subject.total ?? 0}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-gray-600 mb-1">{subject.percentage}%</div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent"
                              style={{ width: `${Math.min(subject.percentage, 100)}%` }}
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

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card">
            <div className="text-xs uppercase tracking-wider px-4 py-3 border-b border-gray-100 text-gray-500">
              Recent attendance history
            </div>
            <div className="max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-6 text-gray-400 text-sm">No history available.</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(-20).reverse().map((entry, idx) => (
                      <tr key={`${entry.date}-${idx}`} className="border-t border-gray-100">
                        <td className="px-4 py-3">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              entry.present ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
                            }`}
                          >
                            {entry.present ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
