import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function TeacherSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/teacher/subjects');
        setSubjects(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your subjects');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">My Subjects</h1>
        <p className="text-gray-500 mt-1">Manage the subjects you handle and quickly take action.</p>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading subjects...</div>
      ) : error ? (
        <div className="text-danger font-semibold">{error}</div>
      ) : (
        <div className="grid gap-4">
          {subjects.map((subject) => (
            <div key={subject._id} className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">{subject.name}</div>
                <div className="text-sm text-gray-500">
                  {subject.code} · {subject.department?.name || 'Department unknown'} · Sem {subject.semester}
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button className="px-4 py-2 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary/90">
                  Take Attendance
                </button>
                <button className="px-4 py-2 rounded-2xl border border-gray-200 text-sm font-semibold hover:border-primary hover:text-primary">
                  Enter Marks
                </button>
                <button className="px-4 py-2 rounded-2xl bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/20">
                  View Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
