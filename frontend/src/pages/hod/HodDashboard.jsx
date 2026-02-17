import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function HodDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [analyticsRes, studentsRes, teachersRes] = await Promise.all([
          api.get('/analytics/hod/department'),
          api.get('/students'),
          api.get('/hod/teachers'),
        ]);
        setAnalytics(analyticsRes.data);
        setStudents(studentsRes.data);
        setTeachers(teachersRes.data.teachers);
      } catch (err) {
        setError('Unable to load department info');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const riskStudents = useMemo(
    () => students.filter((student) => (student.riskLevel || 'Low') === 'High').slice(0, 5),
    [students]
  );

  const stats = useMemo(() => {
    if (!analytics) return [];
    return [
      { title: 'Total students', value: analytics.studentCount, icon: 'people' },
      { title: 'Total teachers', value: analytics.teacherCount, icon: 'school' },
      { title: 'Attendance %', value: `${analytics.overallAttendance}%`, icon: 'event_available' },
      { title: 'High risk students', value: analytics.highRiskStudents, icon: 'warning' },
    ];
  }, [analytics]);

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">HOD Dashboard</h1>
        <p className="text-gray-500 mt-1">Department-level health, attendance, and risk insights.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading department metrics...</div>
      ) : error ? (
        <div className="text-danger font-semibold">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.title} className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-3xl text-primary bg-primary/10 rounded-xl p-2">{stat.icon}</span>
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">High-risk students</h2>
                <span className="text-xs text-gray-400">Top {riskStudents.length}</span>
              </div>
              {riskStudents.length === 0 ? (
                <p className="text-sm text-gray-500">No high-risk students right now.</p>
              ) : (
                <div className="space-y-4">
                  {riskStudents.map((student) => (
                    <div key={student._id} className="rounded-2xl border border-danger/10 bg-danger/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{student.fullName}</div>
                          <div className="text-xs uppercase tracking-wider text-gray-500">
                            {student.department?.name || 'Department'}
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-danger/10 text-danger">High risk</span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600 mt-2">
                        <div>Attendance: {student.attendancePercentage ?? 0}%</div>
                        <div>Marks: {student.marksAveragePercent ?? 0}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Department teachers</h2>
              {teachers.length === 0 ? (
                <p className="text-sm text-gray-500">No teachers assigned yet.</p>
              ) : (
                <div className="space-y-3 text-sm">
                  {teachers.map((teacher) => (
                    <div key={teacher._id} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-900">{teacher.fullName}</div>
                        <div className="text-xs text-gray-400">{teacher.employeeId}</div>
                      </div>
                      <span className="text-xs text-gray-500">{teacher.department?.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
