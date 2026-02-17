import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function Pill({ color = 'gray', children }) {
  const map = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${map[color] || map.gray}`}>
      {children}
    </span>
  );
}

export default function MyAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/analytics/student/me');
        setAnalytics(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const riskPill = useMemo(() => {
    const risk = analytics?.riskLevel;
    if (!risk) return <Pill>Unknown risk</Pill>;
    if (risk === 'Low') return <Pill color="green">Low risk</Pill>;
    if (risk === 'Medium') return <Pill color="amber">Medium risk</Pill>;
    return <Pill color="red">High risk</Pill>;
  }, [analytics]);

  const gradePill = useMemo(() => {
    const g = analytics?.performance?.predictedGrade;
    if (!g) return <Pill>Pending</Pill>;
    if (g === 'A') return <Pill color="green">Predicted: A</Pill>;
    if (g === 'B') return <Pill color="indigo">Predicted: B</Pill>;
    if (g === 'C') return <Pill color="amber">Predicted: C</Pill>;
    return <Pill color="red">Predicted: Fail</Pill>;
  }, [analytics]);

  return (
    <div className="p-2 md:p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">My Analytics</h1>
          <p className="text-gray-500 mt-1">Personalized insights based on real attendance and marks.</p>
        </div>
        <div className="flex items-center gap-2">
          {gradePill}
          {riskPill}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Loading analytics...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="text-danger font-semibold mb-2">Unable to load analytics</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Attendance</h2>
                <p className="text-xs text-gray-400">{analytics?.attendanceSummary?.length || 0} subjects tracked</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analytics?.attendancePercentage || 0}%</div>
            </div>
            <div className="space-y-3">
              {analytics?.attendanceSummary?.map((subject) => (
                <div key={subject.subjectId} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-gray-800">{subject.subjectName}</div>
                    <div className="text-xs text-gray-400">
                      {subject.present}/{subject.total} lectures present
                    </div>
                  </div>
                  <div className="font-semibold">{subject.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">AI Recommendations</h2>
            <div className="space-y-2 text-sm text-gray-700">
              {analytics?.recommendations?.length ? (
                analytics.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="material-icons text-primary text-lg mt-1">task_alt</span>
                    <div>{rec}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No recommendations right now.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
