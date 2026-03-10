import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDefaulters() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMap, setSelectedMap] = useState({});

  useEffect(() => {
    async function loadFilters() {
      try {
        const [deptRes, subjectRes] = await Promise.all([
          api.get('/admin/departments'),
          api.get('/admin/subjects'),
        ]);
        setDepartments(deptRes.data || []);
        setSubjects(subjectRes.data || []);
      } catch (err) {
        setError('Unable to load departments and subjects');
      }
    }
    loadFilters();
  }, []);

  useEffect(() => {
    async function loadDefaulters() {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (departmentId) params.departmentId = departmentId;
        if (subjectId) params.subjectId = subjectId;
        const res = await api.get('/admin/defaulters', { params });
        setStudents(res.data.students || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load defaulter students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    loadDefaulters();
  }, [departmentId, subjectId]);

  const filteredSubjects = useMemo(() => {
    if (!departmentId) return subjects;
    return subjects.filter((subject) => subject.department?._id === departmentId);
  }, [departmentId, subjects]);

  const selectedStudents = useMemo(
    () => students.filter((student) => selectedMap[student._id]),
    [selectedMap, students]
  );

  const toggleStudent = (studentId) => {
    setSelectedMap((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const proceedToSchedule = () => {
    navigate('/admin/extra-classes/create', {
      state: {
        selectedStudents,
        subjectId,
        departmentId,
      },
    });
  };

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Defaulter Students</h1>
          <p className="text-gray-500 mt-1">Students are marked as defaulters when attendance is below 75% or marks are below 40%.</p>
        </div>
        <button
          type="button"
          onClick={proceedToSchedule}
          disabled={!selectedStudents.length}
          className={`px-5 py-3 rounded-2xl font-semibold text-white shadow-soft ${
            selectedStudents.length ? 'bg-primary hover:bg-primary/90' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Schedule Extra Class ({selectedStudents.length})
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setSubjectId('');
            }}
            className="px-4 py-2 rounded-2xl border border-gray-200 bg-white"
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-gray-200 bg-white"
          >
            <option value="">All subjects</option>
            {filteredSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-sm font-semibold text-gray-600">
          Total defaulters: {loading ? 'Loading...' : students.length}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading defaulters...</div>
      ) : error ? (
        <div className="text-danger font-semibold">{error}</div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 text-center text-gray-400">
          No defaulters matched the selected filters.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-card">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Select</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Attendance</th>
                <th className="px-4 py-3 text-left">Marks</th>
                <th className="px-4 py-3 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-t border-gray-100 hover:bg-primary/5">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedMap[student._id])}
                      onChange={() => toggleStudent(student._id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{student.fullName}</div>
                    <div className="text-xs text-gray-400">{student.rollNumber}</div>
                  </td>
                  <td className="px-4 py-3">{student.department?.name || '-'}</td>
                  <td className="px-4 py-3">{student.attendancePercentage}%</td>
                  <td className="px-4 py-3">{student.marksAveragePercent}%</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {student.defaulterReasons.map((reason) => (
                        <span
                          key={reason}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            reason === 'attendance' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                          }`}
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
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
