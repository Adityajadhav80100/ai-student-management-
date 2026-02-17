import React from 'react';

export default function RiskAlertPanel({ students }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 mt-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="material-icons text-danger">warning</span>
        Students Requiring Attention
      </h2>
      {students.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No students at risk. 🎉</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Attendance</th>
                <th className="py-2 px-3 text-left">Risk Level</th>
                <th className="py-2 px-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-red-50/40 transition-all">
                  <td className="py-2 px-3 font-semibold">{s.name}</td>
                  <td className="py-2 px-3">{s.attendance}%</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded-xl text-xs font-bold bg-danger/10 text-danger`}>{s.riskLevel}</span>
                  </td>
                  <td className="py-2 px-3">
                    <button className="bg-danger text-white px-3 py-1 rounded-xl hover:bg-danger/90 transition-all text-xs font-semibold shadow-soft">Alert</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
