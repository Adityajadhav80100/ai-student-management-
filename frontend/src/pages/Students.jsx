import React, { useEffect, useMemo, useState } from 'react';
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
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('');
  const [risk, setRisk] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (search) params.search = search;
        if (departmentId) params.departmentId = departmentId;
        if (semester) params.semester = semester;
        const res = await api.get('/students', { params });
        setStudents(res.data);
      } catch (err) {
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [search, departmentId, semester]);

  const departments = useMemo(() => {
    const seen = new Map();
    students.forEach((student) => {
      if (student.department?.name) {
        seen.set(student.department._id, student.department.name);
      }
    });
    return Array.from(seen.entries(), ([id, name]) => ({ id, name }));
  }, [students]);

  const semesters = useMemo(
    () => Array.from(new Set(students.map((student) => student.semester))).sort((a, b) => a - b),
    [students]
  );

  const filteredStudents = useMemo(() => {
    if (!risk) return students;
    return students.filter((student) => (student.riskLevel || 'Low') === risk);
  }, [students, risk]);

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">Global Student Directory</h1>
        <p className="text-gray-500 mt-1">Search, filter, and inspect every student in the system.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="flex-1 min-w-[220px] px-4 py-2 rounded-2xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          className="px-4 py-2 rounded-2xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 rounded-2xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">All Semesters</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 rounded-2xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
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
        <div className="overflow-x-auto bg-white rounded-2xl shadow-card border border-gray-100">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 uppercase text-xs tracking-wider">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Semester</th>
                <th className="px-4 py-3 text-left">Attendance %</th>
                <th className="px-4 py-3 text-left">CGPA</th>
                <th className="px-4 py-3 text-left">Risk</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="border-t border-gray-100 hover:bg-primary/5 transition-all"
                  >
                    <td className="px-4 py-3 font-semibold">{student.fullName}</td>
                    <td className="px-4 py-3 lowercase">{student.userId?.email || '—'}</td>
                    <td className="px-4 py-3">{student.department?.name || '—'}</td>
                    <td className="px-4 py-3">{student.semester}</td>
                    <td className="px-4 py-3 font-semibold">{student.attendancePercentage ?? '—'}%</td>
                    <td className="px-4 py-3">{student.currentCGPA?.toFixed(2) ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-xl text-xs font-bold ${
                          riskColors[student.riskLevel] || 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {student.riskLevel || 'Low'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-sm text-primary font-semibold hover:underline"
                      >
                        View profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{selectedStudent.fullName}</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">Email</div>
                <p>{selectedStudent.userId?.email || '—'}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">Roll No</div>
                <p>{selectedStudent.rollNumber}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">Department</div>
                <p>{selectedStudent.department?.name || '—'}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">Semester</div>
                <p>{selectedStudent.semester}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">Attendance</div>
                <p>{selectedStudent.attendancePercentage ?? 0}%</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">Risk level</div>
                <p className="font-semibold text-primary">{selectedStudent.riskLevel || 'Low'}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">CGPA</div>
                <p>{selectedStudent.currentCGPA?.toFixed(2) ?? '—'}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">Phone</div>
                <p>{selectedStudent.phone || '—'}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-2xl border border-gray-200 hover:bg-gray-50 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
