import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-600 text-slate-950 shadow-glow-sm',
      border: 'hover:border-amber-400/50',
      badge: 'bg-amber-400/10 text-amber-700 dark:text-amber-300 border-amber-400/30',
    },
    emerald: {
      iconBg: 'bg-gradient-to-tr from-emerald-400 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
      border: 'hover:border-emerald-500/40',
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    },
    amber: {
      iconBg: 'bg-gradient-to-tr from-yellow-400 via-amber-500 to-amber-700 text-white shadow-sm shadow-amber-500/30',
      border: 'hover:border-amber-500/40',
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    },
    rose: {
      iconBg: 'bg-gradient-to-tr from-rose-400 to-red-600 text-white shadow-sm shadow-rose-500/30',
      border: 'hover:border-rose-500/40',
      badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    },
    purple: {
      iconBg: 'bg-gradient-to-tr from-indigo-400 to-purple-600 text-white shadow-sm shadow-purple-500/30',
      border: 'hover:border-purple-500/40',
      badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-[#0c1017] border border-slate-200/80 dark:border-amber-500/15 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 ${scheme.border} group`}>
      {/* Top delicate 24k gold shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.iconBg} transform group-hover:scale-105 transition-transform duration-200`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {trend && (
              <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] border ${scheme.badge}`}>
                {trend.positive ? '+' : ''}{trend.label}
              </span>
            )}
            <span>{subtitle}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
