import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  departmentId: '',
  phone: '',
  active: true,
  assignedSubjects: [],
};

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [subjects, setSubjects] = useState([]);
  const prevDepartmentRef = useRef('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const selectedDepartmentName = useMemo(
    () => departments.find((department) => department._id === form.departmentId)?.name,
    [departments, form.departmentId]
  );

  const clearToast = () => setToast({ message: '', type: 'success' });

  const loadDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data);
    } catch (err) {
      setToast({ message: 'Unable to load departments', type: 'danger' });
    }
  };

  const loadTeachers = async (departmentId = '') => {
    setLoading(true);
    setError('');
    try {
      const query = departmentId ? `?departmentId=${departmentId}` : '';
      const response = await api.get(`/admin/teachers${query}`);
      setTeachers(response.data.teachers || []);
      setTotalTeachers(response.data.total || 0);
      return response.data;
    } catch (err) {
      setError('Unable to load teachers at the moment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await api.get('/admin/subjects');
      setSubjects(response.data);
    } catch (err) {
      setToast({ message: 'Unable to load subjects', type: 'danger' });
    }
  };

  useEffect(() => {
    loadDepartments();
    loadSubjects();
  }, []);

  useEffect(() => {
    loadTeachers(filterDepartment);
  }, [filterDepartment]);

  useEffect(() => {
    if (!editingTeacherId) {
      prevDepartmentRef.current = '';
      return;
    }
    if (prevDepartmentRef.current && prevDepartmentRef.current !== form.departmentId) {
      setForm((prev) => ({ ...prev, assignedSubjects: [] }));
    }
    prevDepartmentRef.current = form.departmentId;
  }, [form.departmentId, editingTeacherId]);

  const openCreateModal = () => {
    setEditingTeacherId(null);
    setForm({ ...initialForm });
    setModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacherId(teacher._id);
    setForm({
      fullName: teacher.fullName || '',
      email: teacher.userId?.email || '',
      password: '',
      departmentId: teacher.department?._id || '',
      phone: teacher.phone || '',
      active: teacher.active ?? true,
      assignedSubjects: teacher.assignedSubjects?.map((subject) => subject._id) || [],
    });
    prevDepartmentRef.current = teacher.department?._id || '';
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.fullName || !form.departmentId || (!editingTeacherId && (!form.email || !form.password))) {
      setToast({ message: 'Name, email, password, and department are required', type: 'danger' });
      return;
    }
    setSaving(true);
    try {
      if (editingTeacherId) {
        await api.patch(`/admin/teachers/${editingTeacherId}`, {
          fullName: form.fullName,
          phone: form.phone,
          departmentId: form.departmentId,
          active: form.active,
        });
        await api.patch(`/admin/teachers/${editingTeacherId}/subjects`, {
          subjectIds: form.assignedSubjects,
        });
        setToast({ message: 'Teacher updated successfully', type: 'success' });
      } else {
        await api.post('/admin/teachers', {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          departmentId: form.departmentId,
          phone: form.phone,
        });
        setToast({ message: 'Teacher created successfully', type: 'success' });
      }
      await loadTeachers(filterDepartment);
      setModalOpen(false);
      setEditingTeacherId(null);
      setForm(initialForm);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to save teacher';
      setToast({ message, type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (teacher) => {
    if (!teacher.active) return;
    if (!window.confirm(`Deactivate ${teacher.fullName}?`)) return;
    try {
      await api.delete(`/admin/teachers/${teacher._id}`);
      setToast({ message: `${teacher.fullName} has been deactivated`, type: 'success' });
      await loadTeachers(filterDepartment);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update teacher status';
      setToast({ message, type: 'danger' });
    }
  };

  const handleFilterChange = (value) => {
    setFilterDepartment(value);
  };

  const handleAssignedSubjectsChange = (values) => {
    setForm((prev) => ({ ...prev, assignedSubjects: values }));
  };

  const departmentSubjectGroups = useMemo(() => {
    if (!form.departmentId) return [];
    const filtered = subjects.filter((subject) => subject.department?._id === form.departmentId);
    const grouped = filtered.reduce((acc, subject) => {
      const key = subject.semester || 'Other';
      acc[key] = acc[key] || [];
      acc[key].push(subject);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([semester, list]) => ({
        semester,
        subjects: list.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => {
        const sa = Number.isNaN(Number(a.semester)) ? Infinity : Number(a.semester);
        const sb = Number.isNaN(Number(b.semester)) ? Infinity : Number(b.semester);
        return sa - sb;
      });
  }, [form.departmentId, subjects]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Teacher Management</h1>
          <p className="text-gray-500 mt-1">Create and manage instructor accounts per department.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-2xl shadow-sm hover:bg-primary/90"
        >
          Add Teacher
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:items-end">
        <div className="flex flex-col gap-1 text-sm text-gray-500">
          <label className="text-xs font-medium text-gray-600">Department filter</label>
          <select
            className="px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent appearance-none pr-9"
            value={filterDepartment}
            onChange={(event) => handleFilterChange(event.target.value)}
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600 md:col-span-2">
          <p>
            Total teachers: <span className="font-semibold text-gray-900">{totalTeachers}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading teachers...</div>
        ) : error ? (
          <div className="text-center text-danger py-8">{error}</div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="text-xs uppercase tracking-wide text-gray-500 bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold">{teacher.fullName}</td>
                    <td className="px-4 py-3 lowercase">{teacher.userId?.email || '—'}</td>
                    <td className="px-4 py-3">{teacher.department?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          teacher.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {teacher.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(teacher)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeactivate(teacher)}
                        disabled={!teacher.active}
                        className="text-xs font-semibold text-danger hover:underline disabled:text-gray-300 disabled:hover:underline"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-8">
                      No teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTeacherId ? 'Update teacher' : 'Add new teacher'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEditingTeacherId(null);
                  setForm(initialForm);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-6">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  Full name
                  <input
                    value={form.fullName}
                    onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                    className="px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  Department
                  <select
                    value={form.departmentId}
                    onChange={(event) => setForm((prev) => ({ ...prev, departmentId: event.target.value }))}
                    className="px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent appearance-none pr-9"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department._id} value={department._id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                    required={!editingTeacherId}
                    disabled={Boolean(editingTeacherId)}
                  />
                </label>
                {!editingTeacherId && (
                  <label className="flex flex-col gap-1 text-sm text-gray-600">
                    Password
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                      className="px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                      required
                    />
                  </label>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  Phone
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  />
                </label>
                {editingTeacherId && (
                  <label className="flex flex-col gap-1 text-sm text-gray-600">
                    Status
                    <select
                      value={form.active ? 'active' : 'inactive'}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, active: event.target.value === 'active' }))
                      }
                      className="px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent appearance-none pr-9"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                )}
              </div>
              {editingTeacherId && (
                <div className="grid gap-3">
                  <label className="flex flex-col gap-1 text-sm text-gray-600">
                    Assigned subjects
                    <select
                      multiple
                      size={Math.max(
                        4,
                        Math.min(
                          8,
                          departmentSubjectGroups.reduce((sum, group) => sum + group.subjects.length, 0) || 4
                        )
                      )}
                      value={form.assignedSubjects}
                      onChange={(event) =>
                        handleAssignedSubjectsChange(
                          Array.from(event.target.selectedOptions, (option) => option.value)
                        )
                      }
                      disabled={!form.departmentId}
                      className="px-2 py-1 border rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none"
                    >
                      {departmentSubjectGroups.length === 0 ? (
                        <option value="" disabled>
                          {form.departmentId
                            ? 'No subjects available for this department'
                            : 'Select a department first'}
                        </option>
                      ) : (
                        departmentSubjectGroups.map((group) => (
                          <optgroup
                            key={group.semester}
                            label={`${selectedDepartmentName ? `${selectedDepartmentName} – ` : ''}Semester ${
                              group.semester
                            }`}
                            disabled={!group.subjects.length}
                          >
                            {group.subjects.map((subject) => (
                              <option key={subject._id} value={subject._id}>
                                {subject.code ? `${subject.code} - ` : ''}
                                {subject.name}
                              </option>
                            ))}
                          </optgroup>
                        ))
                      )}
                    </select>
                    <span className="text-xs text-gray-500 mt-1">
                      Only subjects belonging to the selected department can be assigned.
                    </span>
                  </label>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingTeacherId(null);
                  }}
                  className="px-5 py-2 rounded-2xl border border-gray-200 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-70"
                >
                  {saving ? 'Saving...' : editingTeacherId ? 'Update teacher' : 'Create teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}
