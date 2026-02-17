import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsDashboard() {
  const [gradeDist, setGradeDist] = useState([]);
  const [riskList, setRiskList] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch analytics data from backend
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // fetch all students and compute grade distribution and risk
        const res = await api.get('/students');
        const students = Array.isArray(res.data) ? res.data : [];

        const results = await Promise.all(
          students.map(async (s) => {
            const [pred, risk] = await Promise.all([
              api.post('/analytics/predict', s),
              api.post('/analytics/dropout', s),
            ]);
            return { student: s, predictedGrade: pred.data?.predictedGrade, risk: risk.data?.risk };
          })
        );

        const grades = { A: 0, B: 0, C: 0, Fail: 0 };
        const risks = [];
        const attendance = [];

        for (const r of results) {
          const g = r.predictedGrade || 'Fail';
          if (grades[g] === undefined) grades.Fail++;
          else grades[g]++;
          if (r.risk && r.risk !== 'Low') risks.push({ name: r.student?.name || 'Unknown', risk: r.risk });
          attendance.push({ name: r.student?.name || 'Student', attendance: r.student?.attendance ?? 0 });
        }

        setGradeDist(Object.entries(grades).map(([name, value], i) => ({ name, value, color: COLORS[i] })));
        setRiskList(risks);
        setAttendanceData(attendance);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const riskSummary = useMemo(() => {
    const high = riskList.filter(r => r.risk === 'High').length;
    const medium = riskList.filter(r => r.risk === 'Medium').length;
    return { high, medium, total: riskList.length };
  }, [riskList]);

  return (
    <div className="p-2 md:p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Analytics</h1>
          <p className="text-gray-500 mt-1">Grade distribution, attendance overview, and risk signals.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-danger/10 text-danger font-semibold">
            High: {riskSummary.high}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-warning/10 text-warning font-semibold">
            Medium: {riskSummary.medium}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Crunching insights...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="text-danger font-semibold mb-2">Could not load analytics</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Grade Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={gradeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={86} label>
                  {gradeDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">At-risk students</h2>
            <div className="space-y-2">
              {riskList.slice(0, 10).map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl bg-background border border-gray-100 px-4 py-3">
                  <div className="font-semibold text-gray-900">{r.name}</div>
                  <span
                    className={[
                      'px-3 py-1 rounded-full text-xs font-bold',
                      r.risk === 'High' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning',
                    ].join(' ')}
                  >
                    {r.risk}
                  </span>
                </div>
              ))}
              {riskList.length === 0 && <div className="text-gray-500 text-sm">No high/medium risk students.</div>}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Attendance Overview</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={attendanceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#6366F1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
