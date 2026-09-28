import React, { useState, useEffect } from 'react';
import { adminAPI, consumerAPI } from '../../services/api';
import {
  Zap,
  Calculator,
  Calendar,
  Send,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Hash
} from 'lucide-react';

const MeterReadingForm = ({ onBillGenerated }) => {
  const [consumers, setConsumers] = useState([]);
  const [selectedConsumerId, setSelectedConsumerId] = useState('');
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [previousReading, setPreviousReading] = useState(0);
  const [currentReading, setCurrentReading] = useState('');
  const [billingMonth, setBillingMonth] = useState('October 2026');
  const [dueDate, setDueDate] = useState('2026-11-15');

  const [preview, setPreview] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Load consumers for dropdown selection
  useEffect(() => {
    const fetchConsumers = async () => {
      try {
        const res = await consumerAPI.listConsumers({ status: 'active' });
        setConsumers(res.data.consumers || []);
      } catch (err) {
        console.error('Failed to load consumers list', err);
      }
    };
    fetchConsumers();
  }, []);

  // When consumer changes, auto-load their latest reading
  const handleConsumerChange = (id) => {
    setSelectedConsumerId(id);
    setError(null);
    setSuccessMsg(null);
    setPreview(null);
    setCurrentReading('');

    const found = consumers.find((c) => (c.id || c._id) === id);
    if (found) {
      setSelectedConsumer(found);
      const prev = Number(found.latest_reading || 0);
      setPreviousReading(prev);
    } else {
      setSelectedConsumer(null);
      setPreviousReading(0);
    }
  };

  // Live auto-calculation whenever currentReading or previousReading changes
  useEffect(() => {
    const curr = parseFloat(currentReading);
    const prev = parseFloat(previousReading);

    if (isNaN(curr) || curr < prev) {
      setPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCalculating(true);
      setError(null);
      try {
        const res = await adminAPI.calculatePreview({
          previous_reading: prev,
          current_reading: curr,
        });
        setPreview(res.data.breakdown);
      } catch (err) {
        setError(err.response?.data?.error || 'Live calculation error');
      } finally {
        setCalculating(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [currentReading, previousReading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConsumerId) {
      setError('Please select a consumer first.');
      return;
    }

    const curr = parseFloat(currentReading);
    if (isNaN(curr) || curr < previousReading) {
      setError(`Current reading must be at least equal to previous reading (${previousReading}).`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        consumer_id: selectedConsumerId,
        meter_number: selectedConsumer?.meter_number,
        previous_reading: previousReading,
        current_reading: curr,
        billing_month: billingMonth,
        due_date: dueDate,
      };

      const res = await adminAPI.generateBill(payload);
      setSuccessMsg(res.data.message || 'Bill generated and recorded successfully!');
      setCurrentReading('');
      setPreview(null);
      if (onBillGenerated) {
        onBillGenerated(res.data.bill);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate bill.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/40">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Meter Reading Entry & Bill Generation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select a consumer, input the current meter reading, and review live slab calculations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Row 1: Consumer Select & Meter Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Select Consumer Profile
            </label>
            <select
              value={selectedConsumerId}
              onChange={(e) => handleConsumerChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              required
            >
              <option value="">-- Choose active consumer --</option>
              {consumers.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name} ({c.meter_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-500" />
              Meter Information
            </label>
            <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{selectedConsumer ? selectedConsumer.meter_number : 'No meter selected'}</span>
              {selectedConsumer && (
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-sans font-medium">
                  {selectedConsumer.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Billing Month & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Billing Month
            </label>
            <input
              type="text"
              required
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              placeholder="e.g. October 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Payment Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Row 3: Readings Entry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Previous Meter Reading (kWh)
            </label>
            <input
              type="number"
              value={previousReading}
              onChange={(e) => setPreviousReading(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none text-slate-900 dark:text-white"
              placeholder="0"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Auto-filled from latest statement. Editable if needed.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Meter Reading (kWh) *
            </label>
            <input
              type="number"
              step="any"
              required
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-semibold"
              placeholder={`Enter value >= ${previousReading}`}
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Calculation triggers dynamically as you type.
            </span>
          </div>
        </div>

        {/* Live Auto-calculated Breakdown Preview Card */}
        {preview && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl p-5 border border-blue-200/60 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Live Tariff Breakdown</span>
                {calculating && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Units: {preview.units_consumed} kWh
              </div>
            </div>

            {/* Slab breakdown grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {preview.tiers?.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="font-semibold text-slate-600 dark:text-slate-300">
                    {t.tier}
                  </div>
                  <div className="mt-1 flex items-center justify-between font-mono">
                    <span className="text-slate-400">
                      {t.units} @ ${t.rate}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ${t.cost.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal, fees, tax, total */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Energy Charge:</span>
                <span className="font-mono font-medium">${preview.energy_charge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Fixed Utility Charge:</span>
                <span className="font-mono font-medium">${preview.fixed_charge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax ({preview.tax_rate_percent}%):</span>
                <span className="font-mono font-medium">${preview.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount Due:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  ${preview.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !selectedConsumerId || !currentReading}
            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating & Sending Bill...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generate & Send Bill</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeterReadingForm;
