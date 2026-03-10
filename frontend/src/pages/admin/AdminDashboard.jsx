import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../../components/StatCard';
import MiniSparkline from '../../components/MiniSparkline';
import api from '../../services/api';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      setError('');
      try {
        const [overviewRes, insightsRes] = await Promise.all([
          api.get('/analytics/admin/overview'),
          api.get('/analytics/admin/defaulter-insights'),
        ]);
        setOverview(overviewRes.data);
        setInsights(insightsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load overview');
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  const stats = useMemo(() => {
    if (!overview) return [];
    return [
      {
        title: 'Total Students',
        value: overview.totalStudents,
        icon: 'group',
        change: '+0%',
        changeType: 'neutral',
        spark: [{ value: overview.totalStudents * 0.9 }, { value: overview.totalStudents * 0.95 }, { value: overview.totalStudents }, { value: overview.totalStudents }],
      },
      {
        title: 'Total Teachers',
        value: overview.totalTeachers,
        icon: 'school',
        change: '+0%',
        changeType: 'neutral',
        spark: [{ value: overview.totalTeachers - 1 }, { value: overview.totalTeachers - 1 }, { value: overview.totalTeachers }, { value: overview.totalTeachers }],
      },
      {
        title: 'Overall Attendance',
        value: `${overview.overallAttendance}%`,
        icon: 'event_available',
        change: 'steady',
        changeType: 'neutral',
        spark: [{ value: overview.overallAttendance - 5 }, { value: overview.overallAttendance - 2 }, { value: overview.overallAttendance }, { value: overview.overallAttendance + 1 }],
      },
      {
        title: 'Total Defaulters',
        value: overview.totalDefaulters ?? 0,
        icon: 'warning',
        change: '+0%',
        changeType: 'neutral',
        spark: [{ value: Math.max((overview.totalDefaulters ?? 0) - 2, 0) }, { value: overview.totalDefaulters ?? 0 }, { value: overview.totalDefaulters ?? 0 }],
      },
      {
        title: 'Extra Classes',
        value: overview.extraClassesScheduled ?? 0,
        icon: 'event_note',
        change: 'active',
        changeType: 'neutral',
        spark: [{ value: Math.max((overview.extraClassesScheduled ?? 0) - 1, 0) }, { value: overview.extraClassesScheduled ?? 0 }, { value: overview.extraClassesScheduled ?? 0 }],
      },
    ];
  }, [overview]);

  return (
    <div className="p-2 md:p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of defaulters, remedial scheduling, and improvement tracking.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Loading overview...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="text-danger font-semibold mb-2">Could not load dashboard</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
                changeType={stat.changeType}
              >
                <MiniSparkline data={stat.spark} color="#6366F1" />
              </StatCard>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
              <div className="text-xs uppercase tracking-wide text-gray-400">Improvement Tracking</div>
              <div className="text-3xl font-semibold mt-2">{insights?.improvementTracking?.improvementRate ?? 0}%</div>
              <p className="text-sm text-gray-500 mt-2">
                {insights?.improvementTracking?.improvedStudents ?? 0} of {insights?.improvementTracking?.studentsTracked ?? 0} tracked assignments improved after scheduling.
              </p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
              <div className="text-xs uppercase tracking-wide text-gray-400">Extra Class Attendance</div>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div>Pending: {insights?.extraClassAttendance?.pending ?? 0}</div>
                <div>Present: {insights?.extraClassAttendance?.present ?? 0}</div>
                <div>Absent: {insights?.extraClassAttendance?.absent ?? 0}</div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
              <div className="text-xs uppercase tracking-wide text-gray-400">Risk Snapshot</div>
              <div className="text-3xl font-semibold mt-2">{overview?.highRiskStudents ?? 0}</div>
              <p className="text-sm text-gray-500 mt-2">
                Students currently classified as high risk across attendance and marks analytics.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
