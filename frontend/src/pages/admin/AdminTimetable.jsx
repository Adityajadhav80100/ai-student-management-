import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultForm = {
  departmentId: '',
  semester: '',
  subjectId: '',
  teacherId: '',
  dayOfWeek: 'Monday',
  startTime: '',
  endTime: '',
};

export default function AdminTimetable() {
  const [entries, setEntries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [filters, setFilters] = useState({ departmentId: '', semester: '' });
  const [form, setForm] = useState(defaultForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, departmentsRes, subjectsRes, teachersRes] = await Promise.all([
        api.get('/admin/timetables'),
        api.get('/admin/departments'),
        api.get('/admin/subjects'),
        api.get('/admin/teachers'),
      ]);
      setEntries(entriesRes.data);
      setDepartments(departmentsRes.data);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      setToast('Unable to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!form.departmentId) return subjects;
    return subjects.filter((subject) => subject.department?._id === form.departmentId);
  }, [subjects, form.departmentId]);

  const filteredTeachers = useMemo(() => {
    if (!form.departmentId) return teachers;
    return teachers.filter((teacher) => teacher.department?._id === form.departmentId);
  }, [teachers, form.departmentId]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (filters.departmentId && entry.departmentId?._id !== filters.departmentId) return false;
      if (filters.semester && String(entry.semester) !== filters.semester) return false;
      return true;
    });
  }, [entries, filters]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.departmentId || !form.semester || !form.subjectId || !form.teacherId) {
      setToast('Complete the form before saving.');
      return;
    }
    setSaving(true);
    try {
      const response = await api.post('/admin/timetables', {
        ...form,
        semester: Number(form.semester),
      });
      setEntries((prev) => [response.data, ...prev]);
      setToast('Timetable entry saved.');
      setForm(defaultForm);
    } catch (err) {
      setToast(err.response?.data?.message || 'Could not save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this slot?')) return;
    try {
      await api.delete(`/admin/timetables/${id}`);
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
      setToast('Entry removed.');
    } catch (err) {
      setToast('Failed to remove entry.');
    }
  };

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">Timetable Management</h1>
        <p className="text-gray-500 mt-1">
          Create weekly slots by mapping departments, subjects, and instructors.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_1fr] bg-white shadow-card border border-gray-100 rounded-2xl p-6">
        <div className="space-y-3">
          <label className="text-sm text-gray-600">Department</label>
          <select
            value={form.departmentId}
            onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
            className="w-full px-4 py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-sm text-gray-600">Semester</label>
          <select
            value={form.semester}
            onChange={(e) => setForm((prev) => ({ ...prev, semester: e.target.value }))}
            className="w-full px-4 py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value="">Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-sm text-gray-600">Subject</label>
          <select
            value={form.subjectId}
            onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}
            className="w-full px-4 py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value="">Select subject</option>
            {filteredSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-sm text-gray-600">Teacher</label>
          <select
            value={form.teacherId}
            onChange={(e) => setForm((prev) => ({ ...prev, teacherId: e.target.value }))}
            className="w-full px-4 py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value="">Select teacher</option>
            {filteredTeachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.fullName} ({teacher.employeeId})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-sm text-gray-600">Day</label>
          <select
            value={form.dayOfWeek}
            onChange={(e) => setForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
            className="w-full px-4 py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/40 outline-none"
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-sm text-gray-600">Start time</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
            className="w-full px-4 py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/40 outline-none"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm text-gray-600">End time</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
            className="w-full px-4 py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/40 outline-none"
          />
        </div>
        <div className="md:col-span-2 flex justify-end items-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 text-white bg-primary rounded-2xl font-semibold hover:bg-primary/90"
          >
            {saving ? 'Saving…' : 'Save slot'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filters.departmentId}
            onChange={(e) => setFilters((prev) => ({ ...prev, departmentId: e.target.value }))}
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value="">All departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={filters.semester}
            onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value="">All semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading timetable...</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-card border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Semester</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Teacher</th>
                  <th className="px-4 py-3 text-left">Day</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No timetable entries found.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry._id} className="border-t border-gray-100 hover:bg-primary/5 transition-all">
                      <td className="px-4 py-3">{entry.departmentId?.name || '—'}</td>
                      <td className="px-4 py-3">{entry.semester}</td>
                      <td className="px-4 py-3">{entry.subjectId?.name || '—'}</td>
                      <td className="px-4 py-3">{entry.teacherId?.fullName || '—'}</td>
                      <td className="px-4 py-3">{entry.dayOfWeek}</td>
                      <td className="px-4 py-3">
                        {entry.startTime} - {entry.endTime}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="text-xs font-semibold text-danger hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
