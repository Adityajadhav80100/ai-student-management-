import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthLeftPanel from '../components/AuthLeftPanel';
import { AuthContext } from '../context/AuthContext';

const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

export default function Register() {
  const { setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNo: '',
    department: '',
    semester: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadDepartments = async () => {
      setDepartmentsLoading(true);
      setDepartmentError('');
      try {
        const res = await api.get('/departments');
        if (cancelled) return;
        setDepartments(res.data);
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const redirectToRole = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'hod':
        return '/hod/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === 'student' || form.role === 'hod') {
        payload.department = form.department;
      }
      if (form.role === 'student' && form.semester) {
        payload.semester = Number(form.semester);
      }
      if (form.role === 'student' && form.rollNo) {
        payload.rollNo = form.rollNo;
      }

      const res = await api.post('/auth/register', payload);
      setToken(res.data.accessToken);
      setUser(res.data.user);
      navigate(redirectToRole(res.data.user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex w-full max-w-4xl bg-white/80 rounded-2xl shadow-card overflow-hidden">
        <AuthLeftPanel />
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 bg-white/60 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="w-full max-w-sm glassmorphism p-8 rounded-2xl shadow-soft">
            <h2 className="text-3xl font-extrabold mb-6 text-center text-primary">Create your account</h2>
            {error && <div className="text-danger mb-4 text-center animate-shake">{error}</div>}
            <div className="mb-3">
              <label className="block text-gray-700 font-semibold mb-1">Name</label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 font-semibold mb-1">Password</label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 font-semibold mb-1">Role</label>
              <select
                name="role"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                <option value="hod">HOD</option>
              </select>
            </div>
            {(form.role === 'student' || form.role === 'hod') && (
              <>
                {form.role === 'student' && (
                  <>
                    <div className="mb-3">
                      <label className="block text-gray-700 font-semibold mb-1">Roll No</label>
                      <input
                        type="text"
                        name="rollNo"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                        value={form.rollNo}
                        onChange={handleChange}
                        required
                        placeholder="e.g. CE-23-101"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 font-semibold mb-1">Semester</label>
                      <select
                        name="semester"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                        value={form.semester}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select semester</option>
                        {semesters.map(sem => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
            <div className="mb-3">
              <label className="block text-gray-700 font-semibold mb-1">
                {form.role === 'hod' ? 'Department (required for HOD)' : 'Department'}
              </label>
              <select
                name="department"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                value={form.department}
                onChange={handleChange}
                required
                disabled={departmentsLoading || departments.length === 0}
              >
                <option value="">Select department</option>
                {departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.name} {dep.code ? `(${dep.code})` : ''}
                  </option>
                ))}
              </select>
              {departmentsLoading && (
                <p className="text-sm text-gray-500 mt-1">Loading departments…</p>
              )}
              {!departmentsLoading && departmentError && (
                <p className="text-danger text-sm mt-1">{departmentError}</p>
              )}
              {!departmentsLoading && !departmentError && departments.length === 0 && (
                <p className="text-danger text-sm mt-1">No departments are configured.</p>
              )}
            </div>
          </>
        )}
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all duration-200 shadow-soft ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="animate-spin material-icons align-middle">autorenew</span> : 'Sign Up'}
            </button>
            <div className="mt-6 text-center text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
