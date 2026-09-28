import React from 'react';

const StatusBadge = ({ status }) => {
  const norm = (status || '').toUpperCase();

  const configs = {
    PAID: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      label: 'Paid',
    },
    PENDING: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
      dot: 'bg-amber-500',
      label: 'Pending',
    },
    OVERDUE: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
      dot: 'bg-rose-500',
      label: 'Overdue',
    },
    ACTIVE: {
      bg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800',
      dot: 'bg-teal-500',
      label: 'Active',
    },
    INACTIVE: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      dot: 'bg-slate-400',
      label: 'Inactive',
    },
  };

  const current = configs[norm] || {
    bg: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    dot: 'bg-gray-400',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

export default StatusBadge;
