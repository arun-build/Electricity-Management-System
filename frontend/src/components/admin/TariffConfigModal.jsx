import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { adminAPI } from '../../services/api';
import { Sliders, DollarSign, Percent, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const TariffConfigModal = ({ isOpen, onClose, onUpdated }) => {
  const [tier1, setTier1] = useState(0.10);
  const [tier2, setTier2] = useState(0.15);
  const [tier3, setTier3] = useState(0.20);
  const [fixedCharge, setFixedCharge] = useState(5.00);
  const [taxPercent, setTaxPercent] = useState(5.0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadTariff = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
          const res = await adminAPI.getTariffs();
          const t = res.data.tariff;
          if (t) {
            setTier1(t.tier_1_rate);
            setTier2(t.tier_2_rate);
            setTier3(t.tier_3_rate);
            setFixedCharge(t.fixed_charge);
            setTaxPercent(Number((t.tax_rate * 100).toFixed(2)));
          }
        } catch (err) {
          setError('Failed to fetch active tariff configuration.');
        } finally {
          setLoading(false);
        }
      };
      loadTariff();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        tier_1_rate: parseFloat(tier1),
        tier_2_rate: parseFloat(tier2),
        tier_3_rate: parseFloat(tier3),
        fixed_charge: parseFloat(fixedCharge),
        tax_rate: parseFloat(taxPercent) / 100.0,
      };

      await adminAPI.updateTariffs(payload);
      setSuccess(true);
      if (onUpdated) onUpdated();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update tariff.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dynamic Tariff & Tax Rates Configuration"
      maxWidth="max-w-lg"
    >
      {loading ? (
        <div className="py-12 flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define slab-based energy consumption pricing ($/kWh), standard monthly fixed connection fees, and statutory tax rates.
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Slab Tiers ($ per kWh)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tier 1 (0–100)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={tier1}
                    onChange={(e) => setTier1(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tier 2 (101–300)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={tier2}
                    onChange={(e) => setTier2(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tier 3 (301+)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={tier3}
                    onChange={(e) => setTier3(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fixed Utility Fee ($/month)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={fixedCharge}
                  onChange={(e) => setFixedCharge(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tax Rate (%)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">%</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Tariff settings updated and applied!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 text-sm flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Tariff Configuration</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default TariffConfigModal;
