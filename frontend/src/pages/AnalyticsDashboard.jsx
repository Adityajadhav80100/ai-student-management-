import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

export default function AnalyticsDashboard() {
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/students');
        setStudents(data);
        const limited = data.slice(0, 8);
        const pool = await Promise.all(
          limited.map((student) => api.get(`/analytics/student/${student._id}`).then((res) => ({ student, analytics: res.data })))
        );
        setAnalytics(pool);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const riskStats = useMemo(() => {
    const map = { Low: 0, Medium: 0, High: 0 };
    analytics.forEach(({ analytics: a }) => {
      if (a?.riskLevel) map[a.riskLevel] = (map[a.riskLevel] || 0) + 1;
    });
    return map;
  }, [analytics]);

  const gradeDistribution = useMemo(() => {
    const table = {};
    analytics.forEach(({ analytics: a }) => {
      const grade = a?.performance?.predictedGrade || 'Fail';
      table[grade] = (table[grade] || 0) + 1;
    });
    return Object.entries(table)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .reverse();
  }, [analytics]);

  const attendanceData = useMemo(
    () =>
      analytics.map(({ student, analytics: a }) => ({
        name: student.fullName,
        attendance: a?.attendancePercentage ?? 0,
      })),
    [analytics]
  );

  return (
    <div className="p-2 md:p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Analytics</h1>
          <p className="text-gray-500 mt-1">Predictions, risk signals, and attendance trends for your cohorts.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-danger/10 text-danger font-semibold">
            High risk: {riskStats.High}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-warning/10 text-warning font-semibold">
            Medium risk: {riskStats.Medium}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Crunching insights...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="text-danger font-semibold mb-2">Could not load analytics</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Grade Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">At-risk students</h2>
            <div className="space-y-2">
              {analytics.map(({ student, analytics: a }, index) => (
                <div key={student._id} className="flex items-center justify-between rounded-2xl bg-background border border-gray-100 px-4 py-3">
                  <div>
                    <div className="font-semibold text-gray-900">{student.fullName}</div>
                    <div className="text-xs uppercase text-gray-400">{student.rollNumber}</div>
                  </div>
                  <span
                    className={[
                      'px-3 py-1 rounded-full text-xs font-bold',
                      a?.riskLevel === 'High'
                        ? 'bg-danger/10 text-danger'
                        : a?.riskLevel === 'Medium'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-accent/10 text-accent',
                    ].join(' ')}
                  >
                    {a?.riskLevel || 'Low'}
                  </span>
                </div>
              ))}
              {analytics.length === 0 && (
                <div className="text-gray-500 text-sm">No analytics processed yet.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Attendance Overview</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={attendanceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#6366F1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
