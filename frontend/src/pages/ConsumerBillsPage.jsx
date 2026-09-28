import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { billAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PaymentModal from '../components/consumer/PaymentModal';
import BillReceiptModal from '../components/consumer/BillReceiptModal';
import {
  History,
  CreditCard,
  Printer,
  Eye,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';

const ConsumerBillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [payingBill, setPayingBill] = useState(null);
  const [receiptBill, setReceiptBill] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await billAPI.getBills();
      setBills(res.data.bills || []);
    } catch (err) {
      console.error('Failed to load consumer bills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = bills.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const handlePaymentSuccess = () => {
    fetchBills();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-blue-500" />
            <span>Billing Statements & Receipts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete records of electricity consumption cycles, payable dues, and downloadable invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs shadow-sm">
            {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={fetchBills}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
            title="Refresh Statements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Statements Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Billing Month</th>
                <th className="py-3.5 px-4">Meter #</th>
                <th className="py-3.5 px-4">Readings (Prev → Curr)</th>
                <th className="py-3.5 px-4">Units Consumed</th>
                <th className="py-3.5 px-4">Energy + Tax</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Loading your statements...</span>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No statements found for this filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => {
                  const isUnpaid = b.status === 'PENDING' || b.status === 'OVERDUE';
                  return (
                    <tr
                      key={b.id || b._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {b.billing_month}
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {b.meter_number}
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {b.previous_reading} → <span className="font-semibold text-slate-900 dark:text-white">{b.current_reading}</span>
                      </td>

                      <td className="py-4 px-4 font-mono font-medium text-blue-600 dark:text-blue-400">
                        {b.units_consumed} kWh
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-400">
                        ${Number(b.energy_charge || 0).toFixed(2)} + ${Number(b.tax || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-4 font-mono font-black text-slate-900 dark:text-white text-sm">
                        ${Number(b.total_amount).toFixed(2)}
                      </td>

                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        {b.due_date}
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={b.status} />
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUnpaid && (
                            <button
                              onClick={() => setPayingBill(b)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all flex items-center gap-1 shadow-sm shadow-blue-500/20"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Now</span>
                            </button>
                          )}

                          <button
                            onClick={() => setReceiptBill(b)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors font-medium"
                            title="Printable Statement Invoice"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-500" />
                            <span>Statement</span>
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
      </div>

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

export default ConsumerBillsPage;
