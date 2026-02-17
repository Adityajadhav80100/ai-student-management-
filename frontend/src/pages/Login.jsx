import React, { useState } from 'react';
import api from '../services/api';
import AuthLeftPanel from '../components/AuthLeftPanel';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            <h2 className="text-3xl font-extrabold mb-6 text-center text-primary">Sign in to your account</h2>
            {error && <div className="text-danger mb-4 text-center animate-shake">{error}</div>}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Password</label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-primary rounded"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <span className="text-xs text-primary font-semibold cursor-pointer hover:underline">Forgot password?</span>
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all duration-200 shadow-soft ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="animate-spin material-icons align-middle">autorenew</span> : 'Sign In'}
            </button>
            <div className="mt-6 text-center text-gray-500">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-primary font-semibold hover:underline">Sign up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
