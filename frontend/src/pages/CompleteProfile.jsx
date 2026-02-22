import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.profileCompleted) {
      // Redirect to role dashboard if already completed
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    let cancelled = false;
    const loadDepartments = async () => {
      setDepartmentsLoading(true);
      setDepartmentError('');
      try {
        const res = await api.get('/departments');
        if (!cancelled) {
          setDepartments(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setDepartmentError('Unable to load departments');
        }
      } finally {
        if (!cancelled) {
          setDepartmentsLoading(false);
        }
      }
    };

    loadDepartments();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('Saving profile and enrolling you in your semester…');
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      if (file) {
        if (user.role === 'admin') {
          formData.append('logo', file);
        } else {
          formData.append('photo', file);
        }
      }

      let endpoint = '/profile/student';
      if (user.role === 'teacher') endpoint = '/profile/teacher';
      if (user.role === 'admin') endpoint = '/profile/admin';

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Mark profileCompleted locally and redirect to dashboard
      const nextUser = { ...user, profileCompleted: true };
      setUser(nextUser);
      setStatusMessage('Enrollment complete. Redirecting…');

      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      // Attempt to map backend validation error
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.details) && err.response.data.details[0]?.message) ||
        'Failed to save profile';
      setError(`Oops! ${msg}`);
      setStatusMessage('');
    } finally {
      setLoading(false);
    }
  };

  const renderDepartmentSelect = (label, fieldName = 'department') => (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-1">{label}</label>
      <select
        name={fieldName}
        value={form[fieldName] || ''}
        onChange={handleChange}
        required
        disabled={departmentsLoading || departments.length === 0}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
      >
        <option value="">Select department</option>
        {departments.map((dep) => (
          <option key={dep._id} value={dep._id}>
            {dep.name} {dep.code ? `(${dep.code})` : ''}
          </option>
        ))}
      </select>
      {departmentsLoading && (
        <p className="text-xs text-gray-500 mt-1">Loading departments…</p>
      )}
      {!departmentsLoading && departmentError && (
        <p className="text-danger text-xs mt-1">{departmentError}</p>
      )}
      {!departmentsLoading && !departmentError && departments.length === 0 && (
        <p className="text-danger text-xs mt-1">No departments are available.</p>
      )}
    </div>
  );

  const renderFields = () => {
    if (user.role === 'student') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
              onChange={handleChange}
              required
            />
          </div>
      {renderDepartmentSelect('Department', 'departmentId')}
      <div className="mb-4 w-full lg:w-40">
        <label className="block text-gray-700 font-semibold mb-1">Semester</label>
        <input
          type="number"
          min="1"
          max="12"
          name="semester"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
          onChange={handleChange}
          required
        />
      </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Address</label>
            <textarea
              name="address"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
              rows={2}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Parent Contact</label>
            <input
              type="text"
              name="parentContact"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-1">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
        </>
      );
    }

    if (user.role === 'teacher' || user.role === 'hod') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
              onChange={handleChange}
              required
            />
          </div>
          {renderDepartmentSelect(
            user.role === 'hod' ? 'Department (HOD assignment)' : 'Department',
            'department'
          )}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-1">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
        </>
      );
    }

    // Admin
    return (
      <>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Name</label>
          <input
            type="text"
            name="name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Institution Name</label>
          <input
            type="text"
            name="institutionName"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-1">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-card p-8">
        <h1 className="text-3xl font-extrabold text-primary mb-2 text-center">Complete your profile</h1>
        <p className="text-gray-600 mb-6 text-center">
          We just need a few more details to personalize your {user.role} dashboard.
        </p>
        {error && <div className="text-danger mb-4 text-center animate-shake">{error}</div>}
        <form onSubmit={handleSubmit}>
          {renderFields()}
          {statusMessage && (
            <p className="text-sm text-gray-500 mb-3 text-center">{statusMessage}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all duration-200 shadow-soft ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="animate-spin material-icons align-middle">autorenew</span>
            ) : (
              'Save & Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

