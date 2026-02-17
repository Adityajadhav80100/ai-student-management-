import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';

export default function TeacherStudentAnalytics() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.get('/teacher/subjects');
        setSubjects(res.data);
        setSelectedSubject(res.data[0]?._id || '');
      } catch (err) {
        setError('Unable to load subjects');
      }
    }
    loadSubjects();
  }, []);

  useEffect(() => {
    async function loadStudents() {
      if (!selectedSubject) {
        setStudents([]);
        setSelectedStudent('');
        return;
      }
      try {
        const res = await api.get(`/teacher/subjects/${selectedSubject}/students`);
        setStudents(res.data.students);
        setSelectedStudent(res.data.students[0]?.student._id || '');
      } catch (err) {
        setError('Unable to load students');
        setStudents([]);
      }
    }
    loadStudents();
  }, [selectedSubject]);

  useEffect(() => {
    async function loadAnalytics() {
      if (!selectedStudent) {
        setAnalytics(null);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/analytics/student/${selectedStudent}`);
        setAnalytics(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics for student');
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [selectedStudent]);

  useEffect(() => {
    if (analytics) {
      setToast({
        message: `Loaded analytics for ${analytics.profile.fullName}`,
        type: 'info',
      });
    }
  }, [analytics]);

  const studentOptions = useMemo(() => students.map((entry) => entry.student), [students]);
  const selectedEntry = useMemo(() => students.find((entry) => entry.student._id === selectedStudent), [
    students,
    selectedStudent,
  ]);

  const marksHistory = analytics?.marksSummary?.flatMap((subject) =>
    subject.exams.map((exam) => ({
      subject: subject.subjectName,
      examName: exam.examName,
      percentage: exam.percentage,
    }))
  );

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">Student Analytics</h1>
        <p className="text-gray-500 mt-1">View performance, attendance, and risk for any enrolled student.</p>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
          >
            <option value="">Select student</option>
            {studentOptions.map((student) => (
              <option key={student._id} value={student._id}>
                {student.fullName}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="text-danger text-sm">{error}</div>}
        {loading && <div className="text-gray-400 animate-pulse">Loading analytics...</div>}
        {!loading && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background rounded-2xl p-4 border border-gray-100">
              <div className="text-sm text-gray-500">Predicted Grade</div>
              <div className="text-2xl font-extrabold text-gray-900">{analytics.performance.predictedGrade}</div>
              <div className="text-xs text-gray-400">Pass probability {analytics.performance.passProbability}%</div>
            </div>
            <div className="bg-background rounded-2xl p-4 border border-gray-100">
              <div className="text-sm text-gray-500">Risk Level</div>
              <div className="text-2xl font-extrabold text-gray-900">{analytics.riskLevel}</div>
              <div className="text-xs text-gray-400">{analytics.riskDetails}</div>
            </div>
            <div className="bg-background rounded-2xl p-4 border border-gray-100">
              <div className="text-sm text-gray-500">Attendance</div>
              <div className="text-2xl font-extrabold text-gray-900">{analytics.attendancePercentage}%</div>
              <div className="text-xs text-gray-400">Attendance summary available</div>
            </div>
          </div>
        )}
        {!loading && analytics && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-inner p-4">
            <div className="text-sm font-semibold text-gray-600 mb-3">Marks history</div>
            {marksHistory?.length ? (
              <div className="space-y-3">
                {marksHistory.map((item) => (
                  <div key={`${item.subject}-${item.examName}`} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold text-gray-800">{item.examName}</div>
                      <div className="text-xs text-gray-400">{item.subject}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400">No marks available yet.</div>
            )}
          </div>
        )}
        {!loading && !analytics && (
          <div className="text-gray-500 text-sm">Select a subject + student to see insights.</div>
        )}
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
