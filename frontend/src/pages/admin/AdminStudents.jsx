import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const semesters = Array.from({ length: 8 }, (_, idx) => idx + 1);

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('');
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);

  const params = useMemo(() => {
    const value = {};
    if (departmentId) value.departmentId = departmentId;
    if (semester) value.semester = semester;
    return value;
  }, [departmentId, semester]);

  useEffect(() => {
    let active = true;
    const loadDepartments = async () => {
      setDeptLoading(true);
      try {
        const res = await api.get('/admin/departments');
        if (!active) return;
        setDepartments(res.data);
      } catch (err) {
        if (active) setDepartments([]);
      } finally {
        if (active) setDeptLoading(false);
      }
    };
    loadDepartments();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadStudents = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/admin/students', { params });
        if (!active) return;
        setStudents(res.data.students || []);
        setTotal(res.data.total ?? (res.data.students?.length || 0));
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Unable to load students');
        setStudents([]);
        setTotal(0);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadStudents();
    return () => {
      active = false;
    };
  }, [params]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">Student Directory</h1>
        <p className="text-gray-500 mt-1">
          View every student. Filters are optional—leave them empty to show all profiles.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 bg-white rounded-3xl border border-gray-100 shadow-card p-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={deptLoading}
            className="px-3 py-1 rounded-2xl border border-gray-200 bg-white outline-none pr-8"
          >
            <option value="">All departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name} {dept.code ? `(${dept.code})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-3 py-1 rounded-2xl border border-gray-200 bg-white outline-none pr-8"
          >
            <option value="">All semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-sm font-semibold text-gray-600">
          Total students: {loading ? 'Loading…' : total}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading students…</div>
      ) : error ? (
        <div className="text-center py-10 text-danger">{error}</div>
      ) : students.length === 0 ? (
        <div className="text-center py-10 text-gray-400">No students matched the selected filters.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-card">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Semester</th>
                <th className="px-4 py-3 text-left">Roll No</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-t border-gray-100 hover:bg-primary/5 transition-all">
                  <td className="px-4 py-3 font-semibold">{student.fullName}</td>
                  <td className="px-4 py-3 text-sm lowercase">{student.userId?.email || '—'}</td>
                  <td className="px-4 py-3 text-sm">{student.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm">{student.semester}</td>
                  <td className="px-4 py-3 text-sm">{student.rollNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
