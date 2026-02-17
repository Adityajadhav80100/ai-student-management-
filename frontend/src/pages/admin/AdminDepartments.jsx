import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/admin/departments');
        setDepartments(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load departments');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">Departments</h1>
        <p className="text-gray-500 mt-1">Manage departments, codes, and descriptions.</p>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading departments...</div>
      ) : error ? (
        <div className="text-danger font-semibold">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-card border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id} className="border-t border-gray-100 hover:bg-primary/5 transition-all">
                  <td className="px-4 py-3 font-semibold">{dept.name}</td>
                  <td className="px-4 py-3">{dept.code}</td>
                  <td className="px-4 py-3 text-gray-600">{dept.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
