import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';

const emptyForm = {
  fullName: '',
  email: '',
  employeeId: '',
  departmentId: '',
  subjectsAssigned: [],
  phone: '',
  role: 'teacher',
};

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [teachersRes, departmentsRes, subjectsRes] = await Promise.all([
        api.get('/admin/teachers'),
        api.get('/admin/departments'),
        api.get('/admin/subjects'),
      ]);
      setTeachers(teachersRes.data);
      setDepartments(departmentsRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      setError('Unable to load teacher directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTeacher(null);
  };

  const handleSelectSubjects = (values) => {
    setForm((prev) => ({
      ...prev,
      subjectsAssigned: values,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.fullName || !form.email || !form.employeeId || !form.departmentId) {
      setToast('Fill name, email, employee ID, and department before saving.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        subjectsAssigned: form.subjectsAssigned,
      };
      let response;
      if (editingTeacher) {
        response = await api.put(`/admin/teachers/${editingTeacher._id}`, payload);
        setTeachers((prev) =>
          prev.map((teacher) => (teacher._id === response.data._id ? response.data : teacher))
        );
        setToast('Teacher updated successfully.');
      } else {
        response = await api.post('/admin/teachers', payload);
        setTeachers((prev) => [response.data.teacher, ...prev]);
        setToast(
          `Teacher created. Temp password: ${response.data.credentials.password}.`
        );
      }
      resetForm();
    } catch (err) {
      setToast(err.response?.data?.message || 'Unable to save teacher');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (teacher) => {
    setEditingTeacher(teacher);
    setForm({
      fullName: teacher.fullName || '',
      email: teacher.userId?.email || '',
      employeeId: teacher.employeeId || '',
      departmentId: teacher.department?._id || '',
      subjectsAssigned: teacher.subjectsHandled?.map((subject) => subject._id) || [],
      phone: teacher.phone || '',
      role: teacher.userId?.role || 'teacher',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Remove ${teacher.fullName}?`)) return;
    try {
      await api.delete(`/admin/teachers/${teacher._id}`);
      setTeachers((prev) => prev.filter((item) => item._id !== teacher._id));
        setToast('Teacher removed.');
        if (editingTeacher?._id === teacher._id) {
        resetForm();
      }
    } catch (err) {
      setToast('Could not remove teacher.');
    } finally {
    }
  };

  const subjectOptions = useMemo(
    () =>
      subjects.map((subject) => ({
        label: `${subject.code} - ${subject.name}`,
        value: subject._id,
      })),
    [subjects]
  );

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">Teacher Management</h1>
        <p className="text-gray-500 mt-1">Add, update, or archive instructors and assign roles.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl shadow-card p-6 border border-gray-100">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Full Name
            <input
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              className="px-4 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="px-4 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Employee ID
            <input
              value={form.employeeId}
              onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))}
              className="px-4 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Department
            <select
              value={form.departmentId}
              onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
              className="px-4 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="px-4 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Subjects assigned
            <select
              multiple
              size={4}
              value={form.subjectsAssigned}
              onChange={(e) => handleSelectSubjects(Array.from(e.target.selectedOptions, (opt) => opt.value))}
              className="px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            >
              {subjectOptions.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Role
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="px-4 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
            >
              <option value="teacher">Teacher</option>
              <option value="hod">HOD</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          {editingTeacher && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 rounded-2xl border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 text-white bg-primary rounded-2xl font-semibold hover:bg-primary/90"
            disabled={saving}
          >
            {saving ? 'Saving...' : editingTeacher ? 'Update Teacher' : 'Add Teacher'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading teachers...</div>
      ) : error ? (
        <div className="text-center py-10 text-danger">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-card border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Employee ID</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Subjects</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="border-t border-gray-100 hover:bg-primary/5 transition-all">
                  <td className="px-4 py-3 font-semibold">{teacher.fullName}</td>
                  <td className="px-4 py-3 lowercase">{teacher.userId?.email || '—'}</td>
                  <td className="px-4 py-3">{teacher.employeeId}</td>
                  <td className="px-4 py-3">{teacher.department?.name || '—'}</td>
                  <td className="px-4 py-3">{teacher.subjectsHandled?.length ?? 0}</td>
                  <td className="px-4 py-3">{teacher.userId?.role || 'teacher'}</td>
                  <td className="px-4 py-3">{teacher.phone || '—'}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => startEdit(teacher)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher)}
                      className="text-xs font-semibold text-danger hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No teachers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
