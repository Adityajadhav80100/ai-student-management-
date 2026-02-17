import React, { useEffect } from 'react';

const colorMap = {
  success: 'bg-accent text-white',
  danger: 'bg-danger text-white',
  info: 'bg-primary text-white',
  warning: 'bg-warning text-white',
};

export default function Toast({ message, type = 'success', duration = 4000, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className={`px-6 py-3 rounded-2xl shadow-xl ${colorMap[type] || colorMap.success}`}>
        <p className="text-sm font-semibold">{message}</p>
      </div>
    </div>
  );
}
