import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';

export default function TeacherMarks() {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examName, setExamName] = useState('Midterm');
  const [maxMarks, setMaxMarks] = useState(100);
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [marksMap, setMarksMap] = useState({});
  const [toast, setToast] = useState(null);

  const clearToast = () => setToast(null);

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
        return;
      }
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/teacher/subjects/${selectedSubject}/students`);
        setStudents(data);
        const initial = {};
        data.forEach((item) => {
          initial[item.student._id] = item.analytics?.marksAveragePercent ?? '';
        });
        setMarksMap(initial);
      } catch (err) {
        setError('Failed to load students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [selectedSubject]);

  const records = useMemo(
    () =>
      students.map((item) => ({
        studentId: item.student._id,
        marksObtained: Number(marksMap[item.student._id]) || 0,
      })),
    [students, marksMap]
  );

  const handleSave = async () => {
    if (!selectedSubject) {
      setToast({ message: 'Select a subject before saving', type: 'danger' });
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await api.post('/teacher/marks', {
        subjectId: selectedSubject,
        examName,
        maxMarks,
        examDate,
        records,
      });
      setToast({
        message: response.data.message,
        type: response.data.alreadyRecorded ? 'warning' : 'success',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2 md:p-6 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">Enter Marks</h1>
        <p className="text-gray-500 mt-1">Capture exam results for a subject.</p>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <div className="grid md:grid-cols-4 gap-4">
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
          <input
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="Exam name"
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
          />
          <input
            type="number"
            min={1}
            value={maxMarks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
          />
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/80"
          />
        </div>
        {error && <div className="text-danger text-sm">{error}</div>}
        {loading ? (
          <div className="text-gray-400 animate-pulse">Loading students...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-left">Roll No</th>
                  <th className="px-3 py-2 text-left">Marks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((entry) => (
                  <tr key={entry.student._id} className="border-t border-gray-100 hover:bg-primary/5 transition-all">
                    <td className="px-3 py-2 font-semibold">{entry.student.fullName}</td>
                    <td className="px-3 py-2">{entry.student.rollNumber}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={maxMarks}
                        value={marksMap[entry.student._id] ?? ''}
                        onChange={(e) =>
                          setMarksMap((prev) => ({
                            ...prev,
                            [entry.student._id]: e.target.value,
                          }))
                        }
                        className="w-20 px-3 py-1 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                      />
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-gray-400">
                      Select a subject to load students.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedSubject}
            className={`px-6 py-2 rounded-2xl text-white font-semibold shadow-soft ${
              saving || !selectedSubject ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {saving ? 'Saving...' : 'Save Marks'}
          </button>
        </div>
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />
    </div>
  );
}
