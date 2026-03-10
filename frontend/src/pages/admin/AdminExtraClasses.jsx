import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminExtraClasses() {
  const [extraClasses, setExtraClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/admin/extra-classes');
        setExtraClasses(res.data.extraClasses || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load extra classes');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="px-3 py-4 md:px-6 md:py-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Extra Class List</h1>
          <p className="text-gray-500 mt-1">Review every scheduled remedial session, assigned teacher, and student roster.</p>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse">Loading extra classes...</div>
        ) : error ? (
          <div className="text-danger font-semibold">{error}</div>
        ) : extraClasses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 text-center text-gray-400">
            No extra classes have been scheduled yet.
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {extraClasses.map((extraClass) => (
              <div key={extraClass._id} className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{extraClass.subjectId?.name}</h2>
                    <p className="text-sm text-gray-500">
                      {extraClass.subjectId?.code} | {extraClass.departmentId?.name} | {new Date(extraClass.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="grid gap-1 text-sm text-gray-600 sm:text-right">
                    <div><span className="font-semibold">Teacher:</span> {extraClass.teacherId?.fullName}</div>
                    <div><span className="font-semibold">Location:</span> {extraClass.location}</div>
                    <div><span className="font-semibold">Students:</span> {extraClass.students?.length || 0}</div>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-background/70 border border-gray-100 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Student Roster</div>
                  <div className="flex flex-wrap gap-2">
                    {(extraClass.students || []).map((item) => (
                      <span key={item._id} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {item.studentId?.fullName} ({item.attendanceStatus})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
