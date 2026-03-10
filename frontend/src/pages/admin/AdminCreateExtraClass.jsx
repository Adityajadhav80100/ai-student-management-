import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import api from '../../services/api';

export default function AdminCreateExtraClass() {
  const navigate = useNavigate();
  const location = useLocation();
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [departmentId, setDepartmentId] = useState(location.state?.departmentId || '');
  const [subjectId, setSubjectId] = useState(location.state?.subjectId || '');
  const [teacherId, setTeacherId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [locationText, setLocationText] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMap, setSelectedMap] = useState(() => {
    const selectedStudents = location.state?.selectedStudents || [];
    return selectedStudents.reduce((acc, student) => {
      acc[student._id] = true;
      return acc;
    }, {});
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [deptRes, subjectRes, teacherRes] = await Promise.all([
          api.get('/admin/departments'),
          api.get('/admin/subjects'),
          api.get('/admin/teachers'),
        ]);
        setDepartments(deptRes.data || []);
        setSubjects(subjectRes.data || []);
        setTeachers(teacherRes.data.teachers || []);
      } catch (err) {
        setError('Unable to load extra class form');
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function loadDefaulters() {
      setLoading(true);
      try {
        const params = {};
        if (departmentId) params.departmentId = departmentId;
        if (subjectId) params.subjectId = subjectId;
        const res = await api.get('/admin/defaulters', { params });
        setDefaulters(res.data.students || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load defaulters');
        setDefaulters([]);
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

  const filteredTeachers = useMemo(() => {
    const selectedSubject = subjects.find((subject) => subject._id === subjectId);
    const targetDepartmentId = selectedSubject?.department?._id || departmentId;
    if (!targetDepartmentId) return teachers;
    return teachers.filter((teacher) => teacher.department?._id === targetDepartmentId);
  }, [departmentId, subjectId, subjects, teachers]);

  const selectedStudents = useMemo(
    () => defaulters.filter((student) => selectedMap[student._id]),
    [defaulters, selectedMap]
  );

  const toggleStudent = (studentId) => {
    setSelectedMap((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudents.length) {
      setToast({ message: 'Select at least one defaulter student', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/extra-classes', {
        studentIds: selectedStudents.map((student) => student._id),
        teacherId,
        subjectId,
        scheduledAt,
        location: locationText,
        notes,
      });
      setToast({ message: 'Extra class scheduled and notifications sent', type: 'success' });
      setTimeout(() => navigate('/admin/extra-classes'), 900);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to schedule extra class', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-3 py-4 md:px-6 md:py-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Create Extra Class</h1>
          <p className="text-gray-500 mt-1">Assign a teacher, set the schedule, and notify selected defaulter students.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] xl:items-start">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 md:p-6 space-y-4 xl:sticky xl:top-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setSubjectId('');
                  setTeacherId('');
                }}
                className="w-full px-4 py-2 rounded-2xl border border-gray-200 bg-white"
              >
                <option value="">Select department</option>
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
                className="w-full px-4 py-2 rounded-2xl border border-gray-200 bg-white"
              >
                <option value="">Select subject</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Teacher</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border border-gray-200 bg-white"
              >
                <option value="">Assign teacher</option>
                {filteredTeachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Date and Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border border-gray-200 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Room 204, Lab Block"
              className="w-full px-4 py-2 rounded-2xl border border-gray-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white"
              placeholder="Focus areas for the extra class"
            />
          </div>
          {error && <div className="text-danger text-sm">{error}</div>}
          <button
            type="submit"
            disabled={saving || !teacherId || !subjectId || !scheduledAt || !locationText}
            className={`w-full px-5 py-3 rounded-2xl font-semibold text-white ${
              saving || !teacherId || !subjectId || !scheduledAt || !locationText
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {saving ? 'Scheduling...' : 'Schedule Extra Class'}
          </button>
        </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Selected Students</h2>
              <p className="text-sm text-gray-500">Choose the defaulters who should attend this session.</p>
            </div>
            <div className="text-sm font-semibold text-gray-600">{selectedStudents.length} selected</div>
          </div>
          {loading ? (
            <div className="text-gray-400 animate-pulse">Loading defaulters...</div>
          ) : defaulters.length === 0 ? (
            <div className="text-gray-400">No defaulters available for the current filters.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3 max-h-[620px] overflow-y-auto pr-1">
              {defaulters.map((student) => (
                <label key={student._id} className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 hover:bg-primary/5">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedMap[student._id])}
                    onChange={() => toggleStudent(student._id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">{student.fullName}</div>
                      <div className="text-xs text-gray-400">{student.rollNumber}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-warning/10 text-warning">
                        Attendance {student.attendancePercentage}%
                      </span>
                      <span className="px-2 py-1 rounded-full bg-danger/10 text-danger">
                        Marks {student.marksAveragePercent}%
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
          </div>
        </form>
        <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
