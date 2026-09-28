import React, { useRef } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import Logo from '../common/Logo';
import { Printer, Zap, CheckCircle2, ShieldCheck, Building2, MapPin } from 'lucide-react';

const BillReceiptModal = ({ isOpen, onClose, bill }) => {
  const receiptRef = useRef();

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const units = Number(bill.units_consumed || 0);
  const t1Units = Math.min(units, 100);
  const t2Units = Math.min(Math.max(units - 100, 0), 200);
  const t3Units = Math.max(units - 300, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Electricity Billing Statement & Tax Invoice"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Printable Invoice Container */}
        <div
          ref={receiptRef}
          className="printable-receipt bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm"
        >
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-3.5">
              <Logo size="lg" />
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Official Statement
              </div>
              <div className="font-mono text-base font-black text-slate-900 mt-0.5">
                #INV-{bill.id ? bill.id.slice(-8).toUpperCase() : '99201-B'}
              </div>
              <div className="mt-1.5">
                <StatusBadge status={bill.status} />
              </div>
            </div>
          </div>

          {/* Consumer & Meter Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Billed Consumer
              </span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {bill.consumer_name || bill.consumer?.name || 'Alex Johnson'}
              </div>
              <div className="text-slate-600 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span>{bill.consumer_address || bill.consumer?.address || '123 Main Street, Suite 4B'}</span>
              </div>
              <div className="text-slate-500 mt-0.5">
                {bill.consumer_email || bill.consumer?.email || 'alex@example.com'}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Meter & Billing Cycle
              </span>
              <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                Meter #{bill.meter_number}
              </div>
              <div className="text-slate-600 mt-0.5">
                Billing Month: <strong>{bill.billing_month}</strong>
              </div>
              <div className="text-slate-600 mt-0.5">
                Due Date: <strong className="text-rose-600 font-mono">{bill.due_date}</strong>
              </div>
            </div>
          </div>

          {/* Meter Readings Row */}
          <div className="grid grid-cols-3 gap-2 text-center p-3.5 bg-sky-50/60 rounded-xl border border-sky-100 text-xs">
            <div>
              <span className="text-slate-500 text-[11px]">Previous Reading</span>
              <div className="font-mono font-bold text-slate-900 text-base mt-0.5">
                {bill.previous_reading} kWh
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Current Reading</span>
              <div className="font-mono font-bold text-slate-900 text-base mt-0.5">
                {bill.current_reading} kWh
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Net Consumed</span>
              <div className="font-mono font-black text-sky-700 text-base mt-0.5">
                {bill.units_consumed} kWh
              </div>
            </div>
          </div>

          {/* Slab-Based Tariff Breakdown Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Slab-Based Energy Charges Breakdown
              </h4>
              <span className="text-[11px] text-slate-400">Standard Residential Tariff</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Tariff Slab Tier</th>
                    <th className="p-2.5 text-center">Units (kWh)</th>
                    <th className="p-2.5 text-right">Rate ($/kWh)</th>
                    <th className="p-2.5 text-right">Subtotal ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium">Tier 1 (0 – 100 units)</td>
                    <td className="p-2.5 text-center font-mono">{t1Units.toFixed(1)}</td>
                    <td className="p-2.5 text-right font-mono">$0.10</td>
                    <td className="p-2.5 text-right font-mono font-semibold">
                      ${(t1Units * 0.10).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Tier 2 (101 – 300 units)</td>
                    <td className="p-2.5 text-center font-mono">{t2Units.toFixed(1)}</td>
                    <td className="p-2.5 text-right font-mono">$0.15</td>
                    <td className="p-2.5 text-right font-mono font-semibold">
                      ${(t2Units * 0.15).toFixed(2)}
                    </td>
                  </tr>
                  {t3Units > 0 && (
                    <tr>
                      <td className="p-2.5 font-medium">Tier 3 (301+ units)</td>
                      <td className="p-2.5 text-center font-mono">{t3Units.toFixed(1)}</td>
                      <td className="p-2.5 text-right font-mono">$0.20</td>
                      <td className="p-2.5 text-right font-mono font-semibold">
                        ${(t3Units * 0.20).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charges & Grand Total Calculations */}
          <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Energy Charges:</span>
              <span className="font-mono font-semibold">${Number(bill.energy_charge || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Standard Fixed Customer Charge:</span>
              <span className="font-mono font-semibold">${Number(bill.fixed_charge || 5.0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>State Electricity Tax (5% on subtotal):</span>
              <span className="font-mono font-semibold">${Number(bill.tax || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
              <span>Total Amount Payable:</span>
              <span className="font-mono text-sky-700 text-lg">
                ${Number(bill.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment receipt confirmation if PAID */}
          {bill.status === 'PAID' && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-emerald-800">Electronic Payment Verified & Settled</div>
                  <div className="text-emerald-700 font-mono mt-0.5">
                    Ref: {bill.payment_details?.transaction_id || 'TXN-CONFIRMED'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-emerald-700">Settled On</span>
                <div className="font-mono font-medium">
                  {bill.paid_at ? new Date(bill.paid_at).toLocaleDateString() : 'Confirmed'}
                </div>
              </div>
            </div>
          )}

          {/* Footer disclaimer */}
          <div className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-200">
            VoltGrid Utility Corp. • Reg No: PUB-VG-99201 • Registered Office: 100 Grid Avenue, Capital City
          </div>
        </div>

        {/* Modal Action Buttons (hidden in print mode) */}
        <div className="flex items-center justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BillReceiptModal;
