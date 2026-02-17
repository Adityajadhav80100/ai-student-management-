import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/admin/subjects');
        setSubjects(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load subjects');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(subjects.map((subject) => subject.department?.name))).filter(Boolean),
    [subjects]
  );

  const filtered = useMemo(
    () => (department ? subjects.filter((subject) => subject.department?.name === department) : subjects),
    [subjects, department]
  );

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Subjects</h1>
          <p className="text-gray-500 mt-1">Curriculum, semesters, and teacher assignments.</p>
        </div>
        <select
          className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80 text-sm"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading subjects...</div>
      ) : error ? (
        <div className="text-danger font-semibold">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-card border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Semester</th>
                <th className="px-4 py-3 text-left">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((subject) => (
                <tr key={subject._id} className="border-t border-gray-100 hover:bg-primary/5 transition-all">
                  <td className="px-4 py-3 font-semibold">{subject.name}</td>
                  <td className="px-4 py-3">{subject.code}</td>
                  <td className="px-4 py-3">{subject.department?.name ?? '—'}</td>
                  <td className="px-4 py-3">{subject.semester}</td>
                  <td className="px-4 py-3">{subject.assignedTeacher?.fullName || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
