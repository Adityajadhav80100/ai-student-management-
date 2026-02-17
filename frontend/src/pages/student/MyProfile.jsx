import React, { useContext, useEffect, useState } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

export default function MyProfile() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    phone: '',
    address: '',
    parentContact: '',
    section: '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await api.get('/students/me');
        const profile = res.data.profile;
        setForm({
          phone: profile.phone || '',
          address: profile.address || '',
          parentContact: profile.parentContact || '',
          section: profile.section || '',
        });
      } catch (err) {
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (photo) {
        data.append('photo', photo);
      }
      const res = await api.post('/profile/student', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Profile updated');
      setUser((prev) => (prev ? { ...prev, profileCompleted: true } : prev));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2 md:p-6 lg:p-10">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">My Profile</h1>
        <p className="text-gray-500 mt-1">Keep your contact info and section up to date.</p>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading profile...</div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4 max-w-2xl"
        >
          {error && <div className="text-danger text-sm">{error}</div>}
          {success && <div className="text-accent text-sm">{success}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-gray-500">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
            />
            <label className="text-sm text-gray-500">Parent Contact</label>
            <input
              type="text"
              name="parentContact"
              value={form.parentContact}
              onChange={handleChange}
              className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
            />
            <label className="text-sm text-gray-500">Section</label>
            <input
              type="text"
              name="section"
              value={form.section}
              onChange={handleChange}
              className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
            />
            <label className="text-sm text-gray-500">Address</label>
            <textarea
              name="address"
              rows={2}
              value={form.address}
              onChange={handleChange}
              className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Profile Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-2xl text-white font-semibold shadow-soft ${
                saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
