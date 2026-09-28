import React, { useState, useEffect } from 'react';
import { adminAPI, billAPI } from '../services/api';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import ConsumerModal from '../components/admin/ConsumerModal';
import TariffConfigModal from '../components/admin/TariffConfigModal';
import BillReceiptModal from '../components/consumer/BillReceiptModal';
import {
  DollarSign,
  AlertCircle,
  Zap,
  Clock,
  Plus,
  Sliders,
  FileText,
  Eye,
  CheckCircle2,
  RefreshCw,
  Users
} from 'lucide-react';

const AdminDashboardPage = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isConsumerModalOpen, setIsConsumerModalOpen] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [selectedReceiptBill, setSelectedReceiptBill] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, billsRes] = await Promise.all([
        adminAPI.getMetrics(),
        billAPI.getBills({ limit: 6 }),
      ]);
      setMetrics(metricsRes.data.metrics);
      setRecentBills(billsRes.data.bills.slice(0, 6));
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time utility revenue, meter reading statuses, and consumer billing operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          <button
            onClick={() => setIsTariffModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Tariff Rates</span>
          </button>

          <button
            onClick={() => setIsConsumerModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-blue-500" />
            <span>New Consumer</span>
          </button>

          <button
            onClick={() => onNavigate('bills')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Enter Meter Reading</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue Collected"
          value={`$${Number(metrics?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle={`${metrics?.paid_payments || 0} bills settled`}
          icon={DollarSign}
          color="emerald"
        />

        <StatCard
          title="Total Outstanding Dues"
          value={`$${Number(metrics?.total_dues || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle={`${(metrics?.pending_payments || 0) + (metrics?.overdue_payments || 0)} unpaid accounts`}
          icon={AlertCircle}
          color="rose"
        />

        <StatCard
          title="Total Active Meters"
          value={metrics?.active_meters || 0}
          subtitle={`Across ${metrics?.total_consumers || 0} registered consumers`}
          icon={Zap}
          color="blue"
        />

        <StatCard
          title="Pending Payments"
          value={metrics?.pending_payments || 0}
          subtitle={`${metrics?.overdue_payments || 0} flagged as overdue`}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Recent Statements Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Billing Statements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest monthly meter cycles and collection statuses.
            </p>
          </div>
          <button
            onClick={() => onNavigate('bills')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All Bills →
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Consumer</th>
                <th className="py-3 px-4">Meter #</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Units Consumed</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No billing statements found.
                  </td>
                </tr>
              ) : (
                recentBills.map((b) => (
                  <tr
                    key={b.id || b._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {b.consumer_name || 'Consumer'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {b.meter_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {b.billing_month}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {b.units_consumed} kWh
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${Number(b.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {b.due_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceiptBill(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="View statement invoice"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>Statement</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ConsumerModal
        isOpen={isConsumerModalOpen}
        onClose={() => setIsConsumerModalOpen(false)}
        onSuccess={fetchDashboardData}
      />

      <TariffConfigModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        onUpdated={fetchDashboardData}
      />

      {selectedReceiptBill && (
        <BillReceiptModal
          isOpen={!!selectedReceiptBill}
          onClose={() => setSelectedReceiptBill(null)}
          bill={selectedReceiptBill}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
