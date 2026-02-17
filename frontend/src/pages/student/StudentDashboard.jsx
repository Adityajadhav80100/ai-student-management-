import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

export default function StudentDashboard() {
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
        setError('Unable to load your analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        title: 'Attendance %',
        value: `${analytics.attendancePercentage ?? 0}%`,
        icon: 'event_available',
        change: `${analytics.attendancePercentage ?? 0}%`,
      },
      {
        title: 'Average Marks',
        value: `${analytics.averageMarksPercent ?? 0}%`,
        icon: 'grading',
        change: `${analytics.averageMarksPercent ?? 0}%`,
      },
      {
        title: 'Predicted Grade',
        value: analytics.performance?.predictedGrade || 'Pending',
        icon: 'insights',
        change: `Pass ${analytics.performance?.passProbability ?? 0}%`,
      },
      {
        title: 'Risk Level',
        value: analytics.riskLevel || 'Low',
        icon: 'warning',
        change: analytics.riskDetails || 'Stability steady',
      },
    ];
  }, [analytics]);

  const recommendationList = analytics?.recommendations || [];

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Student Dashboard</h1>
          <p className="text-gray-500 mt-1">Get instant visibility into attendance, marks, and AI insights.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Loading your stats...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="text-danger font-semibold mb-2">Failed to load</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
                changeType="neutral"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Detailed insights</h2>
                <span className="text-xs uppercase tracking-wider text-gray-400">{analytics?.profile?.department?.name || 'No department'}</span>
              </div>
              <p className="text-sm text-gray-500">
                Predicted grade {analytics?.performance?.predictedGrade || '—'} with {analytics?.performance?.passProbability}%
                pass probability. Attendance is {analytics?.attendancePercentage ?? 0}% and current risk is {analytics?.riskLevel || 'Low'}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide">Attendance</div>
                  <div className="text-lg font-semibold">{analytics?.attendancePercentage ?? 0}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide">Average marks</div>
                  <div className="text-lg font-semibold">{analytics?.averageMarksPercent ?? 0}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide">Risk level</div>
                  <div className="text-lg font-semibold">{analytics?.riskLevel || 'Low'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide">Best subject</div>
                  <div className="text-lg font-semibold">
                    {analytics?.marksSummary?.reduce((best, subject) => {
                      if (!subject.averagePercent) return best;
                      if (!best || subject.averagePercent > best.averagePercent) return subject;
                      return best;
                    }, null)?.subjectName || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
              <h2 className="text-xl font-semibold">AI Recommendations</h2>
              {recommendationList.length === 0 ? (
                <p className="text-sm text-gray-500">No recommendations yet. Attend classes and enter marks for the AI to learn.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {recommendationList.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-2">
                      <span className="material-icons text-warning text-base">lightbulb</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
