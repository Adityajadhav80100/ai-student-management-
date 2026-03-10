import React, { useEffect, useMemo, useState } from 'react';
import Toast from '../../components/Toast';
import api from '../../services/api';

export default function TeacherExtraClasses() {
  const [extraClasses, setExtraClasses] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/teacher/extra-classes');
        setExtraClasses(res.data.extraClasses || []);
        const nextMap = {};
        (res.data.extraClasses || []).forEach((extraClass) => {
          nextMap[extraClass._id] = (extraClass.students || []).reduce((acc, item) => {
            acc[item.studentId?._id] = item.attendanceStatus || 'pending';
            return acc;
          }, {});
        });
        setAttendanceMap(nextMap);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load assigned extra classes');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hasClasses = useMemo(() => extraClasses.length > 0, [extraClasses]);

  const setStatus = (extraClassId, studentId, attendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [extraClassId]: {
        ...(prev[extraClassId] || {}),
        [studentId]: attendanceStatus,
      },
    }));
  };

  const saveAttendance = async (extraClass) => {
    setSavingId(extraClass._id);
    try {
      const records = (extraClass.students || []).map((item) => ({
        studentId: item.studentId?._id,
        attendanceStatus: attendanceMap[extraClass._id]?.[item.studentId?._id] === 'absent' ? 'absent' : 'present',
      }));
      const res = await api.patch(`/teacher/extra-classes/${extraClass._id}/attendance`, { records });
      setToast({ message: res.data.message, type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Unable to update attendance', type: 'danger' });
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="px-3 py-4 md:px-6 md:py-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
        <h1 className="text-3xl font-extrabold text-primary">Assigned Extra Classes</h1>
        <p className="text-gray-500 mt-1">View your remedial sessions, student list, and mark attendance.</p>
        </div>
      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading extra classes...</div>
      ) : error ? (
        <div className="text-danger font-semibold">{error}</div>
      ) : !hasClasses ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 text-center text-gray-400">
          No extra classes assigned to you yet.
        </div>
      ) : (
        <div className="grid gap-5">
          {extraClasses.map((extraClass) => (
            <div key={extraClass._id} className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{extraClass.subjectId?.name}</h2>
                  <p className="text-sm text-gray-500">
                    {extraClass.subjectId?.code} • {new Date(extraClass.scheduledAt).toLocaleString()} • {extraClass.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveAttendance(extraClass)}
                  disabled={savingId === extraClass._id}
                  className={`px-5 py-2 rounded-2xl text-white font-semibold ${
                    savingId === extraClass._id ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {savingId === extraClass._id ? 'Saving...' : 'Mark Attendance'}
                </button>
              </div>

              <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-100">
                <table className="min-w-full text-sm">
                  <thead className="text-gray-500 text-xs uppercase tracking-wider bg-background/70">
                    <tr>
                      <th className="px-3 py-2 text-left">Student</th>
                      <th className="px-3 py-2 text-left">Roll No</th>
                      <th className="px-3 py-2 text-left">Department</th>
                      <th className="px-3 py-2 text-left">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(extraClass.students || []).map((item) => (
                      <tr key={item._id} className="border-t border-gray-100 bg-white">
                        <td className="px-3 py-2 font-semibold">{item.studentId?.fullName}</td>
                        <td className="px-3 py-2">{item.studentId?.rollNumber}</td>
                        <td className="px-3 py-2">{item.studentId?.department?.name}</td>
                        <td className="px-3 py-2">
                          <select
                            value={attendanceMap[extraClass._id]?.[item.studentId?._id] || 'pending'}
                            onChange={(e) => setStatus(extraClass._id, item.studentId?._id, e.target.value)}
                            className="w-full min-w-[140px] px-3 py-2 rounded-2xl border border-gray-200 bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
        <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
