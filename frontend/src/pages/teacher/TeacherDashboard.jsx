import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../../components/StatCard';
import MiniSparkline from '../../components/MiniSparkline';
import api from '../../services/api';

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSubjects() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/teacher/subjects');
        setSubjects(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load subjects');
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  const stats = useMemo(
    () => [
      {
        title: 'My Subjects',
        value: subjects.length,
        icon: 'menu_book',
        spark: subjects.slice(-4).map(() => ({ value: 3 + Math.random() * 5 })),
      },
      {
        title: 'Upcoming Classes',
        value: subjects.length * 2,
        icon: 'event_available',
        spark: subjects.slice(-4).map(() => ({ value: 1 + Math.random() * 3 })),
      },
      {
        title: 'Students Impacted',
        value: subjects.reduce((sum, subject) => sum + (subject?.enrolledCount || 5), 0),
        icon: 'groups',
        spark: subjects.slice(-4).map(() => ({ value: 8 + Math.random() * 6 })),
      },
    ],
    [subjects]
  );

  return (
    <div className="p-2 md:p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Teacher Dashboard</h1>
          <p className="text-gray-500 mt-1">Stay on top of your classes, attendance, and analytics.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Loading your subjects...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="text-danger font-semibold mb-2">Could not load subjects</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon}>
              <MiniSparkline data={stat.spark} color="#6366F1" />
            </StatCard>
          ))}
        </div>
      )}
    </div>
  );
}
