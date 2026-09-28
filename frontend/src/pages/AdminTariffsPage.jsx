import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import TariffConfigModal from '../components/admin/TariffConfigModal';
import {
  Sliders,
  Zap,
  DollarSign,
  Percent,
  Edit,
  Calculator,
  Layers,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

const AdminTariffsPage = () => {
  const [tariff, setTariff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Interactive Simulator state
  const [simUnits, setSimUnits] = useState(250);

  const fetchTariff = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getTariffs();
      setTariff(res.data.tariff);
    } catch (err) {
      console.error('Failed to load tariffs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariff();
  }, []);

  // Simulator calculation
  const units = parseFloat(simUnits) || 0;
  const t1Rate = tariff?.tier_1_rate ?? 0.10;
  const t2Rate = tariff?.tier_2_rate ?? 0.15;
  const t3Rate = tariff?.tier_3_rate ?? 0.20;
  const fixed = tariff?.fixed_charge ?? 5.00;
  const taxRate = tariff?.tax_rate ?? 0.05;

  const t1Units = Math.min(units, 100);
  const t1Cost = t1Units * t1Rate;

  const t2Units = Math.min(Math.max(units - 100, 0), 200);
  const t2Cost = t2Units * t2Rate;

  const t3Units = Math.max(units - 300, 0);
  const t3Cost = t3Units * t3Rate;

  const energyCharge = t1Cost + t2Cost + t3Cost;
  const subtotal = energyCharge + fixed;
  const tax = subtotal * taxRate;
  const totalPayable = subtotal + tax;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-500" />
            <span>Slab Tariff Engine Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure dynamic slab rates ($/kWh), standard fixed customer charges, and statutory tax rates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Edit className="w-4 h-4" />
          <span>Update Rates & Charges</span>
        </button>
      </div>

      {/* Active Tariff Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tier 1 (0 – 100 kWh)
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white font-mono">
            ${Number(t1Rate).toFixed(2)}
            <span className="text-xs font-sans text-slate-400 font-normal"> / kWh</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Lifeline consumption bracket for standard residential baseline.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tier 2 (101 – 300 kWh)
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white font-mono">
            ${Number(t2Rate).toFixed(2)}
            <span className="text-xs font-sans text-slate-400 font-normal"> / kWh</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Mid-level consumer rate bracket (maximum 200 units).
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tier 3 (301+ kWh)
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white font-mono">
            ${Number(t3Rate).toFixed(2)}
            <span className="text-xs font-sans text-slate-400 font-normal"> / kWh</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            High consumption surcharge bracket.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Fixed Fee & Tax
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white font-mono">
            ${Number(fixed).toFixed(2)}
            <span className="text-xs font-sans text-slate-400 font-normal"> + {(taxRate * 100).toFixed(0)}% Tax</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Base connection charge applied per monthly statement.
          </p>
        </div>
      </div>

      {/* Interactive Slab Simulation Playground */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900/40">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Interactive Tariff Calculation Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adjust sample consumption units to test the mathematical slab engine in real-time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Simulated Consumption (kWh)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={simUnits}
                onChange={(e) => setSimUnits(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Presets:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {[75, 150, 250, 350, 500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSimUnits(preset)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 rounded-lg font-mono text-xs font-medium transition-colors"
                  >
                    {preset} kWh
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Breakdown Output Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Component</th>
                    <th className="py-2.5 px-4 text-center">Units</th>
                    <th className="py-2.5 px-4 text-right">Rate</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                      Tier 1 (0 – 100 kWh)
                    </td>
                    <td className="py-2.5 px-4 text-center">{t1Units.toFixed(1)}</td>
                    <td className="py-2.5 px-4 text-right">${t1Rate.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-semibold">${t1Cost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                      Tier 2 (101 – 300 kWh)
                    </td>
                    <td className="py-2.5 px-4 text-center">{t2Units.toFixed(1)}</td>
                    <td className="py-2.5 px-4 text-right">${t2Rate.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-semibold">${t2Cost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                      Tier 3 (301+ kWh)
                    </td>
                    <td className="py-2.5 px-4 text-center">{t3Units.toFixed(1)}</td>
                    <td className="py-2.5 px-4 text-right">${t3Rate.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-semibold">${t3Cost.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td colSpan={3} className="py-2.5 px-4 font-sans font-semibold text-slate-700 dark:text-slate-300">
                      Total Energy Charge:
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold">${energyCharge.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-400">
                      Fixed Customer Service Charge:
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold">${fixed.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-400">
                      Tax ({(taxRate * 100).toFixed(0)}% on subtotal):
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold">${tax.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 text-sm">
                    <td colSpan={3} className="py-3 px-4 font-sans font-black">
                      Total Payable Amount:
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-blue-600 dark:text-blue-400">
                      ${totalPayable.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <TariffConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdated={fetchTariff}
      />
    </div>
  );
};

export default AdminTariffsPage;
