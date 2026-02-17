import React, { useEffect, useState } from 'react';
import api from '../services/api';

const riskColors = {
  Low: 'bg-accent/10 text-accent',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-danger/10 text-danger',
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [risk, setRisk] = useState('');

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const res = await api.get('/students');
        setStudents(res.data);
      } catch (err) {
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const departments = Array.from(new Set(students.map(s => s.department)));
  const filtered = students.filter(s =>
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())) &&
    (!department || s.department === department) &&
    (!risk || s.riskLevel === risk)
  );

  return (
    <div className="p-2 md:p-6 lg:p-10">
      <h1 className="text-3xl font-extrabold mb-8 text-primary">Student List</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or roll no."
          className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
          value={department}
          onChange={e => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
        <select
          className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
          value={risk}
          onChange={e => setRisk(e.target.value)}
        >
          <option value="">All Risk Levels</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Loading students...</div>
      ) : error ? (
        <div className="text-center py-20 text-danger">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-card">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Roll No</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Semester</th>
                <th className="py-3 px-4 text-left">Attendance</th>
                <th className="py-3 px-4 text-left">Marks</th>
                <th className="py-3 px-4 text-left">CGPA</th>
                <th className="py-3 px-4 text-left">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No students found.</td></tr>
              ) : filtered.map(s => (
                <tr key={s._id} className="border-t border-gray-100 hover:bg-primary/5 transition-all">
                  <td className="py-2 px-4 font-semibold">{s.name}</td>
                  <td className="py-2 px-4">{s.rollNo}</td>
                  <td className="py-2 px-4">{s.department}</td>
                  <td className="py-2 px-4">{s.semester}</td>
                  <td className="py-2 px-4">{s.attendance}%</td>
                  <td className="py-2 px-4">{s.internalMarks}</td>
                  <td className="py-2 px-4">{s.previousCGPA}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-xl text-xs font-bold ${riskColors[s.riskLevel] || 'bg-gray-100 text-gray-500'}`}>{s.riskLevel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
