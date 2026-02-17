import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MiniSparkline({ data, color = '#6366F1' }) {
  return (
    <ResponsiveContainer width="100%" height={24}>
      <LineChart data={data} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
