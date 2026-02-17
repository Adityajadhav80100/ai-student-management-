import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';

export default function TeacherAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const [attendanceLocked, setAttendanceLocked] = useState(false);
  const [toast, setToast] = useState(null);

  const clearToast = () => setToast(null);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.get('/teacher/subjects');
        setSubjects(res.data);
        setSelectedSubject(res.data[0]?._id || '');
      } catch (err) {
        setError('Could not load subjects');
      }
    }
    loadSubjects();
  }, []);

  useEffect(() => {
    async function loadStudents() {
      if (!selectedSubject) {
        setStudents([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/teacher/subjects/${selectedSubject}/students`, {
          params: { date },
        });
        const map = {};
        res.data.students.forEach((entry) => {
          map[entry.student._id] = entry.attendanceStatus || 'present';
        });
        setStudents(res.data.students);
        setStatusMap(map);
        setAttendanceLocked(res.data.attendanceLocked);
      } catch (err) {
        setError('Failed to load students for this subject');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [selectedSubject, date]);

  const handleToggle = (studentId) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const records = useMemo(
    () =>
      students.map((entry) => ({
        studentId: entry.student._id,
        status: statusMap[entry.student._id] || 'present',
      })),
    [students, statusMap]
  );

  const handleSave = async () => {
    if (!selectedSubject) {
      setToast({ message: 'Select a subject first', type: 'danger' });
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await api.post('/teacher/attendance', {
        subjectId: selectedSubject,
        date,
        records,
      });
      setToast({
        message: response.data.message,
        type: response.data.alreadySubmitted ? 'warning' : 'success',
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to save attendance',
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">Take Attendance</h1>
        <p className="text-gray-500 mt-1">Record attendance for the selected class.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <select
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        {error && <div className="text-danger text-sm">{error}</div>}
        {attendanceLocked && (
          <div className="text-warning text-sm font-semibold">
            Attendance already submitted for {date}. Saving will update the existing records.
          </div>
        )}
        {loading ? (
          <div className="text-gray-400 animate-pulse">Loading students...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-left">Roll No</th>
                  <th className="px-3 py-2 text-left">Grade</th>
                  <th className="px-3 py-2 text-left">Attendance %</th>
                  <th className="px-3 py-2 text-left">Risk</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Toggle</th>
                </tr>
              </thead>
              <tbody>
                {students.map((entry) => {
                  const student = entry.student;
                  const current = statusMap[student._id] || 'present';
                  return (
                    <tr key={student._id} className="border-t border-gray-100 hover:bg-primary/5 transition-all">
                      <td className="px-3 py-2 font-semibold">{student.fullName}</td>
                      <td className="px-3 py-2">{student.rollNumber}</td>
                      <td className="px-3 py-2">{entry.analytics?.predictedGrade || '—'}</td>
                      <td className="px-3 py-2">{entry.analytics?.attendancePercentage ?? '—'}%</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            entry.analytics?.riskLevel === 'High'
                              ? 'bg-danger/10 text-danger'
                              : entry.analytics?.riskLevel === 'Medium'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-accent/10 text-accent'
                          }`}
                        >
                          {entry.analytics?.riskLevel || 'Low'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            'px-3 py-1 rounded-full text-xs font-semibold',
                            current === 'present' ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger',
                          ].join(' ')}
                        >
                          {current}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          className="px-4 py-1 rounded-full border border-gray-200 text-xs font-semibold hover:border-primary hover:text-primary"
                          onClick={() => handleToggle(student._id)}
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-400">
                      Select a subject and date to load students.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !selectedSubject}
            className={`px-6 py-2 rounded-2xl text-white font-semibold shadow-soft ${
              saving || !selectedSubject ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />
    </div>
  );
}
