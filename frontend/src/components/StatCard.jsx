import React from 'react';

export default function StatCard({ title, value, icon, change, changeType, children }) {
  // changeType: 'up' | 'down' | 'neutral'
  const changeColor =
    changeType === 'up' ? 'text-accent' :
    changeType === 'down' ? 'text-danger' :
    'text-gray-400';
  const changeIcon =
    changeType === 'up' ? 'trending_up' :
    changeType === 'down' ? 'trending_down' :
    'horizontal_rule';

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-2 min-w-[220px]">
      <div className="flex items-center gap-3 mb-2">
        <span className="material-icons text-3xl text-primary bg-primary/10 rounded-xl p-2">{icon}</span>
        <span className="text-lg font-semibold text-gray-700">{title}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-extrabold text-gray-900">{value}</span>
        <span className={`flex items-center gap-1 text-sm font-bold ${changeColor}`}>
          <span className="material-icons text-base">{changeIcon}</span>
          {change}
        </span>
      </div>
      <div className="h-6 mt-2">{children}</div>
    </div>
  );
}
