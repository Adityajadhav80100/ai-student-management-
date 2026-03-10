import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function StudentExtraClasses() {
  const [data, setData] = useState({ extraClasses: [], notifications: [], defaulterStatus: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/students/extra-classes');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load extra classes');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusTone = useMemo(() => {
    if (!data.defaulterStatus?.isDefaulter) return 'bg-accent/10 text-accent';
    return 'bg-danger/10 text-danger';
  }, [data.defaulterStatus]);

  return (
    <div className="px-3 py-4 md:px-6 md:py-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
        <h1 className="text-3xl font-extrabold text-primary">My Extra Classes</h1>
        <p className="text-gray-500 mt-1">Check your defaulter status, extra classes, and latest scheduling notifications.</p>
        </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading your extra classes...</div>
      ) : error ? (
        <div className="text-danger font-semibold">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Defaulter status</div>
                  <div className="text-2xl font-semibold mt-1">
                    {data.defaulterStatus?.isDefaulter ? 'Marked as defaulter' : 'Not a defaulter'}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone}`}>
                  {data.defaulterStatus?.isDefaulter ? 'Action required' : 'On track'}
                </span>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>Attendance: {data.defaulterStatus?.attendancePercentage ?? 0}%</div>
                <div>Marks: {data.defaulterStatus?.marksAveragePercent ?? 0}%</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 md:p-6">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {(data.notifications || []).slice(0, 5).map((notification) => (
                  <div key={notification._id} className="rounded-2xl bg-background border border-gray-100 p-4">
                    <div className="font-semibold">{notification.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{notification.message}</div>
                  </div>
                ))}
                {!data.notifications?.length && <div className="text-sm text-gray-400">No notifications yet.</div>}
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {(data.extraClasses || []).map((extraClass) => (
              <div key={extraClass.id} className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{extraClass.subject?.name}</h2>
                    <p className="text-sm text-gray-500">
                      {extraClass.teacher?.fullName} • {new Date(extraClass.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      extraClass.attendanceStatus === 'present'
                        ? 'bg-accent/10 text-accent'
                        : extraClass.attendanceStatus === 'absent'
                        ? 'bg-danger/10 text-danger'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {extraClass.attendanceStatus}
                  </span>
                </div>
                <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-4 gap-4 text-sm text-gray-600 rounded-2xl bg-background/70 border border-gray-100 p-4">
                  <div><span className="font-semibold">Subject:</span> {extraClass.subject?.code}</div>
                  <div><span className="font-semibold">Teacher:</span> {extraClass.teacher?.fullName}</div>
                  <div><span className="font-semibold">Location:</span> {extraClass.location}</div>
                  <div><span className="font-semibold">Reason:</span> {extraClass.reason}</div>
                </div>
              </div>
            ))}
            {!data.extraClasses?.length && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 text-center text-gray-400">
                No extra classes assigned right now.
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
