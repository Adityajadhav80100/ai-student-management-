import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function Pill({ color = 'gray', children }) {
  const map = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${map[color] || map.gray}`}>
      {children}
    </span>
  );
}

export default function MyAnalytics() {
  const [student, setStudent] = useState(null);
  const [predicted, setPredicted] = useState(null);
  const [dropout, setDropout] = useState(null);
  const [recommend, setRecommend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMy() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/students/me');
        setStudent(data);

        const [predRes, riskRes, recRes] = await Promise.all([
          api.post('/analytics/predict', data),
          api.post('/analytics/dropout', data),
          api.post('/analytics/recommend', { studentData: data, predictions: {} }),
        ]);
        setPredicted(predRes.data);
        setDropout(riskRes.data);
        setRecommend(recRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchMy();
  }, []);

  const riskPill = useMemo(() => {
    const risk = dropout?.risk;
    if (!risk) return <Pill color="gray">Unknown risk</Pill>;
    if (risk === 'Low') return <Pill color="green">Low risk</Pill>;
    if (risk === 'Medium') return <Pill color="amber">Medium risk</Pill>;
    return <Pill color="red">High risk</Pill>;
  }, [dropout]);

  const gradePill = useMemo(() => {
    const g = predicted?.predictedGrade;
    if (!g) return <Pill color="gray">No prediction</Pill>;
    if (g === 'A') return <Pill color="green">Predicted: A</Pill>;
    if (g === 'B') return <Pill color="indigo">Predicted: B</Pill>;
    if (g === 'C') return <Pill color="amber">Predicted: C</Pill>;
    return <Pill color="red">Predicted: Fail</Pill>;
  }, [predicted]);

  return (
    <div className="p-2 md:p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">My Analytics</h1>
          <p className="text-gray-500 mt-1">Personal performance insights powered by AI.</p>
        </div>
        <div className="flex items-center gap-2">
          {gradePill}
          {riskPill}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Loading your analytics...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="text-danger font-semibold mb-2">We couldn’t load your analytics</div>
          <div className="text-gray-600 text-sm">{error}</div>
          <div className="text-gray-500 text-sm mt-4">
            If you just created your account, make sure you registered as <b>Student</b> with a valid <b>Roll No</b>.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Your profile snapshot</h2>
              <Pill color="gray">{student?.department} • Sem {student?.semester}</Pill>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-background p-4 border border-gray-100">
                <div className="text-sm text-gray-500">Attendance</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">{student?.attendance ?? 0}%</div>
              </div>
              <div className="rounded-2xl bg-background p-4 border border-gray-100">
                <div className="text-sm text-gray-500">Internal marks</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">{student?.internalMarks ?? 0}</div>
              </div>
              <div className="rounded-2xl bg-background p-4 border border-gray-100">
                <div className="text-sm text-gray-500">Assignment completion</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">{student?.assignmentCompletion ?? 0}%</div>
              </div>
              <div className="rounded-2xl bg-background p-4 border border-gray-100">
                <div className="text-sm text-gray-500">Previous CGPA</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">{student?.previousCGPA ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">AI recommendations</h2>
            <div className="space-y-3 text-sm text-gray-700">
              {Array.isArray(recommend?.recommendations) && recommend.recommendations.length > 0 ? (
                recommend.recommendations.slice(0, 6).map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="material-icons text-primary text-lg mt-[2px]">task_alt</span>
                    <div>{r}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">
                  No recommendations yet. Add more attendance/marks history to get better insights.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

