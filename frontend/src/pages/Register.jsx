import React, { useState } from 'react';
import api from '../services/api';
import AuthLeftPanel from '../components/AuthLeftPanel';

const departments = [
  'Computer Engineering',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Chemical',
  'Other',
];
const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

export default function Register() {
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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Registration successful! You can now log in.');
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
            {success && <div className="text-accent mb-4 text-center animate-fade-in">{success}</div>}
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
              </select>
            </div>
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
                <div className="mb-3">
                  <label className="block text-gray-700 font-semibold mb-1">Department</label>
                  <select
                    name="department"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
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
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all duration-200 shadow-soft ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="animate-spin material-icons align-middle">autorenew</span> : 'Sign Up'}
            </button>
            <div className="mt-6 text-center text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="text-primary font-semibold hover:underline">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
