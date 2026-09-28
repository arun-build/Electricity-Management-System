import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { billAPI } from '../services/api';
import HeroBillCard from '../components/consumer/HeroBillCard';
import ConsumptionChart from '../components/consumer/ConsumptionChart';
import PaymentModal from '../components/consumer/PaymentModal';
import BillReceiptModal from '../components/consumer/BillReceiptModal';
import StatusBadge from '../components/common/StatusBadge';
import {
  CreditCard,
  History,
  Eye,
  RefreshCw,
  Zap,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const ConsumerDashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active bill to display in Hero card
  const [activeBill, setActiveBill] = useState(null);

  // Modals
  const [payingBill, setPayingBill] = useState(null);
  const [receiptBill, setReceiptBill] = useState(null);

  const fetchConsumerData = async () => {
    setLoading(true);
    try {
      const [billsRes, trendsRes] = await Promise.all([
        billAPI.getBills(),
        billAPI.getAnalytics(),
      ]);

      const allBills = billsRes.data.bills || [];
      setBills(allBills);
      setTrends(trendsRes.data.trends || []);

      // Find first PENDING or OVERDUE bill, else latest bill
      const unpaid = allBills.find((b) => b.status === 'PENDING' || b.status === 'OVERDUE');
      setActiveBill(unpaid || allBills[0] || null);
    } catch (err) {
      console.error('Failed to load consumer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumerData();
  }, []);

  const handlePaymentSuccess = (updatedBill) => {
    fetchConsumerData();
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Consumer'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Meter Account: <strong className="font-mono text-slate-800 dark:text-slate-200">{user?.meter_number}</strong> • Service Address: {user?.address}
          </p>
        </div>

        <button
          onClick={fetchConsumerData}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
        </button>
      </div>

      {/* Hero Card for Active Bill */}
      <section>
        <HeroBillCard
          bill={activeBill}
          onPayClick={(bill) => setPayingBill(bill)}
          onViewReceiptClick={(bill) => setReceiptBill(bill)}
        />
      </section>

      {/* Consumption Analytics Line/Bar Chart */}
      <section>
        <ConsumptionChart
          data={trends}
          title={`Electricity Consumption Trend (Meter #${user?.meter_number})`}
        />
      </section>

      {/* Recent Statements Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Billing History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review monthly electricity statements, units, and settled payments.
            </p>
          </div>
          <button
            onClick={() => onNavigate('bills')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            All Statements →
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Readings (Prev → Curr)</th>
                <th className="py-3 px-4">Net Units</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No billing statements on file.
                  </td>
                </tr>
              ) : (
                bills.slice(0, 5).map((b) => {
                  const isUnpaid = b.status === 'PENDING' || b.status === 'OVERDUE';
                  return (
                    <tr
                      key={b.id || b._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {b.billing_month}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {b.previous_reading} → {b.current_reading} kWh
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-600 dark:text-blue-400">
                        {b.units_consumed} kWh
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                        ${Number(b.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {b.due_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUnpaid && (
                            <button
                              onClick={() => setPayingBill(b)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}
                          <button
                            onClick={() => setReceiptBill(b)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            title="View receipt statement"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      {payingBill && (
        <PaymentModal
          isOpen={!!payingBill}
          onClose={() => setPayingBill(null)}
          bill={payingBill}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {receiptBill && (
        <BillReceiptModal
          isOpen={!!receiptBill}
          onClose={() => setReceiptBill(null)}
          bill={receiptBill}
        />
      )}
    </div>
  );
};

export default ConsumerDashboardPage;
