import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BarChart3, LineChart as LineIcon, Zap, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ConsumptionChart = ({ data, title = "Electricity Consumption Trend" }) => {
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No historical consumption data recorded yet.
        </p>
      </div>
    );
  }

  // Calculate average units consumed
  const avgUnits = Math.round(
    data.reduce((acc, curr) => acc + (curr.units_consumed || 0), 0) / data.length
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
            {label}
          </p>
          <div className="flex items-center justify-between gap-4 text-blue-600 dark:text-blue-400">
            <span>Units Consumed:</span>
            <span className="font-bold">{payload[0]?.value} kWh</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
              <span>Billed Amount:</span>
              <span className="font-bold">${Number(payload[1]?.value).toFixed(2)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header with Title, Stats & Chart Type Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            Monthly average: <strong className="text-slate-700 dark:text-slate-300">{avgUnits} kWh</strong>
          </p>
        </div>

        {/* Toggle Line / Bar View */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              chartType === 'line'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span>Line</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              chartType === 'bar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar</span>
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 mt-5">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#334155' : '#f1f5f9'}
                vertical={false}
              />
              <XAxis
                dataKey="billing_month"
                stroke={isDark ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={isDark ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="units_consumed"
                name="Units (kWh)"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="total_amount"
                name="Cost ($)"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#10b981' }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#334155' : '#f1f5f9'}
                vertical={false}
              />
              <XAxis
                dataKey="billing_month"
                stroke={isDark ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={isDark ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar
                dataKey="units_consumed"
                name="Units (kWh)"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="total_amount"
                name="Cost ($)"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConsumptionChart;
