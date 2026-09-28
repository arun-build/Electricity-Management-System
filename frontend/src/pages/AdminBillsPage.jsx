import React, { useState, useEffect } from 'react';
import { billAPI } from '../services/api';
import MeterReadingForm from '../components/admin/MeterReadingForm';
import StatusBadge from '../components/common/StatusBadge';
import BillReceiptModal from '../components/consumer/BillReceiptModal';
import {
  FileText,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Zap,
  Calendar,
  Hash,
  ArrowUpDown
} from 'lucide-react';

const AdminBillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceiptBill, setSelectedReceiptBill] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm.trim()) params.meter_number = searchTerm.trim();

      const res = await billAPI.getBills(params);
      setBills(res.data.bills || []);
    } catch (err) {
      console.error('Failed to load bills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBills();
    }, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Meter Entry Form Section */}
      <section>
        <MeterReadingForm onBillGenerated={fetchBills} />
      </section>

      {/* Bills Registry Table Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>Electricity Billing Statements Registry</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              History of all generated utility statements, payments, and overdue tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search meter number..."
                className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white shadow-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs shadow-sm">
              {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
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
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
              title="Refresh bills table"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Consumer</th>
                  <th className="py-3 px-4">Meter #</th>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Readings (Prev → Curr)</th>
                  <th className="py-3 px-4">Units Consumed</th>
                  <th className="py-3 px-4">Energy + Tax</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      <span>Loading billing records...</span>
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No billing records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  bills.map((b) => (
                    <tr
                      key={b.id || b._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {b.consumer_name || 'Consumer'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.consumer_email || ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {b.meter_number}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {b.billing_month}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {b.previous_reading} → <span className="font-bold text-slate-900 dark:text-white">{b.current_reading}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {b.units_consumed} kWh
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        ${Number(b.energy_charge || 0).toFixed(2)} + ${Number(b.tax || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white text-sm">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors font-medium"
                          title="View statement invoice"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bill Receipt Modal */}
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

export default AdminBillsPage;
