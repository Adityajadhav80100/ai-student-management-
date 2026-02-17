import React, { useContext, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import MiniSparkline from '../components/MiniSparkline';
import RiskAlertPanel from '../components/RiskAlertPanel';
import GradeDistributionChart from '../components/GradeDistributionChart';
import AttendanceTrendChart from '../components/AttendanceTrendChart';
import RiskLevelBarChart from '../components/RiskLevelBarChart';
import PerformanceAreaChart from '../components/PerformanceAreaChart';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        if (user?.role === 'student') {
          const res = await api.get('/students/me');
          setMe(res.data);
          setStudents([]);
        } else {
          const res = await api.get('/students');
          setStudents(res.data);
          setMe(null);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.role]);

  const isStudent = user?.role === 'student';

  const computed = useMemo(() => {
    if (isStudent) {
      const attendance = me?.attendance ?? 0;
      const internalMarks = me?.internalMarks ?? 0;
      const assignmentCompletion = me?.assignmentCompletion ?? 0;
      const previousCGPA = me?.previousCGPA ?? 0;

      return {
        stats: [
          { title: 'Attendance', value: `${attendance}%`, icon: 'event_available', spark: [{ value: attendance - 4 }, { value: attendance - 2 }, { value: attendance }, { value: attendance + 1 }] },
          { title: 'Internal Marks', value: internalMarks, icon: 'grading', spark: [{ value: Math.max(0, internalMarks - 8) }, { value: Math.max(0, internalMarks - 4) }, { value: internalMarks }, { value: internalMarks + 2 }] },
          { title: 'Assignments', value: `${assignmentCompletion}%`, icon: 'task', spark: [{ value: assignmentCompletion - 6 }, { value: assignmentCompletion - 2 }, { value: assignmentCompletion }, { value: assignmentCompletion + 1 }] },
          { title: 'Prev CGPA', value: previousCGPA, icon: 'insights', spark: [{ value: Math.max(0, previousCGPA - 0.4) }, { value: Math.max(0, previousCGPA - 0.2) }, { value: previousCGPA }, { value: Math.min(10, previousCGPA + 0.1) }] },
        ],
        gradeData: [
          { grade: 'A', value: internalMarks >= 80 ? 1 : 0 },
          { grade: 'B', value: internalMarks >= 65 && internalMarks < 80 ? 1 : 0 },
          { grade: 'C', value: internalMarks >= 50 && internalMarks < 65 ? 1 : 0 },
          { grade: 'D', value: internalMarks >= 40 && internalMarks < 50 ? 1 : 0 },
          { grade: 'F', value: internalMarks < 40 ? 1 : 0 },
        ],
        riskBar: [
          { risk: 'Low', count: 0 },
          { risk: 'Medium', count: 0 },
          { risk: 'High', count: 0 },
        ],
        highRiskStudents: [],
        avgAttendance: attendance,
      };
    }

    // Admin/Teacher view
    const total = students.length;
    const highRisk = students.filter(s => s.riskLevel === 'High');
    const avgAttendance = total ? Math.round(students.reduce((a, s) => a + (s.attendance || 0), 0) / total) : 0;
    const passProb = total ? Math.round((students.filter(s => (s.internalMarks || 0) >= 40 && (s.attendance || 0) >= 65).length / total) * 100) : 0;

    const stats = [
      {
        title: 'Total Students',
        value: total,
        icon: 'group',
        change: '+0%',
        changeType: 'neutral',
        spark: students.slice(-4).map((s) => ({ value: s ? s.attendance : 0 })),
      },
      {
        title: 'High Risk Students',
        value: highRisk.length,
        icon: 'warning',
        change: '+0%',
        changeType: 'neutral',
        spark: highRisk.slice(-4).map((s) => ({ value: s ? s.attendance : 0 })),
      },
      {
        title: 'Avg Attendance',
        value: `${avgAttendance}%`,
        icon: 'event_available',
        change: '+0%',
        changeType: 'neutral',
        spark: students.slice(-4).map((s) => ({ value: s ? s.attendance : 0 })),
      },
      {
        title: 'Pass Probability',
        value: `${passProb}%`,
        icon: 'insights',
        change: '+0%',
        changeType: 'neutral',
        spark: students.slice(-4).map((s) => ({ value: s ? s.internalMarks : 0 })),
      },
    ];

    const highRiskStudents = highRisk.map((s, i) => ({
      id: i,
      name: s.name,
      attendance: s.attendance,
      riskLevel: s.riskLevel,
    }));

    const gradeData = [
      { grade: 'A', value: students.filter(s => s.internalMarks >= 80).length },
      { grade: 'B', value: students.filter(s => s.internalMarks >= 65 && s.internalMarks < 80).length },
      { grade: 'C', value: students.filter(s => s.internalMarks >= 50 && s.internalMarks < 65).length },
      { grade: 'D', value: students.filter(s => s.internalMarks >= 40 && s.internalMarks < 50).length },
      { grade: 'F', value: students.filter(s => s.internalMarks < 40).length },
    ];

    const riskBar = [
      { risk: 'Low', count: students.filter(s => s.riskLevel === 'Low').length },
      { risk: 'Medium', count: students.filter(s => s.riskLevel === 'Medium').length },
      { risk: 'High', count: students.filter(s => s.riskLevel === 'High').length },
    ];

    return { stats, gradeData, riskBar, highRiskStudents, avgAttendance };
  }, [isStudent, me, students]);

  // Attendance trend (mocked for now) 
  const attendanceTrend = [
    { month: 'Jan', attendance: computed.avgAttendance - 4 },
    { month: 'Feb', attendance: computed.avgAttendance - 2 },
    { month: 'Mar', attendance: computed.avgAttendance },
    { month: 'Apr', attendance: computed.avgAttendance + 2 },
    { month: 'May', attendance: computed.avgAttendance + 3 },
  ];

  // Performance area (mocked for now)
  const performanceArea = [
    { month: 'Jan', performance: computed.avgAttendance - 2 },
    { month: 'Feb', performance: computed.avgAttendance },
    { month: 'Mar', performance: computed.avgAttendance + 1 },
    { month: 'Apr', performance: computed.avgAttendance + 2 },
    { month: 'May', performance: computed.avgAttendance + 3 },
  ];

  return (
    <div className="p-2 md:p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {isStudent ? 'Your personal academic snapshot.' : 'Class overview and risk insights.'}
          </p>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Loading analytics...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="text-danger font-semibold mb-2">Could not load dashboard</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {computed.stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change || '+0%'}
                changeType={stat.changeType || 'neutral'}
              >
                <MiniSparkline data={stat.spark} color="#6366F1" />
              </StatCard>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <GradeDistributionChart data={computed.gradeData} />
            <AttendanceTrendChart data={attendanceTrend} />
            <RiskLevelBarChart data={computed.riskBar} />
            <PerformanceAreaChart data={performanceArea} />
          </div>
          {!isStudent && <RiskAlertPanel students={computed.highRiskStudents} />}
        </>
      )}
    </div>
  );
}

