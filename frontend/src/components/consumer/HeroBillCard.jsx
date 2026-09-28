import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { CreditCard, Calendar, Zap, AlertCircle, CheckCircle2, ArrowRight, Shield, Sparkles, Wifi } from 'lucide-react';

const HeroBillCard = ({ bill, onPayClick, onViewReceiptClick }) => {
  if (!bill) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c121e] via-[#080c14] to-[#040609] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-amber-500/25">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-amber-400/20 to-yellow-600/20 text-amber-300 rounded-2xl border border-amber-400/30 shadow-glow-gold">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif tracking-wide text-amber-100">
              Account Privileges Active & Settled
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              All utility statements are settled in full. Your residential metering runs on premium priority grid status.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isPending = bill.status === 'PENDING';
  const isOverdue = bill.status === 'OVERDUE';
  const isPaid = bill.status === 'PAID';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0e1422] via-[#090d16] to-[#05070a] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-amber-500/30 ring-1 ring-amber-400/10 group">
      {/* Top delicate 24k gold shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

      {/* Atmospheric luxury radial glow lights */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Black Card Layout */}
        <div className="space-y-4">
          {/* Header Row: EMV Gold Chip + VIP Tier Pill */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            {/* Realistic EMV Smart Chip */}
            <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-600 p-[1px] shadow-sm shadow-amber-950/40">
              <div className="w-full h-full rounded-[7px] bg-[#221b0e] border border-amber-400/50 flex flex-col justify-around p-1">
                <div className="h-[1px] bg-amber-400/60 w-full" />
                <div className="h-[1px] bg-amber-400/60 w-3/4 mx-auto" />
                <div className="h-[1px] bg-amber-400/60 w-full" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-amber-400/15 to-yellow-500/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{bill.billing_month} Statement</span>
              </span>
              <StatusBadge status={bill.status} />
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <span>Executive Balance Due</span>
              {isOverdue && (
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                  Overdue
                </span>
              )}
            </div>

            <div className="mt-1 text-4xl sm:text-6xl font-black tracking-tight font-serif flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-sans font-bold text-amber-300">$</span>
              <span className="bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm font-mono">
                {Number(bill.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Payment Due:</span>
              <strong className="text-amber-100 font-mono tracking-wide">{bill.due_date || 'N/A'}</strong>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Total Billed Units:</span>
              <strong className="text-white font-mono">{bill.units_consumed} kWh</strong>
            </div>
          </div>

          {/* Meter Readings Luxury Row */}
          <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-amber-500/15 pt-2 max-w-md">
            <div>
              Cycle Start: <span className="font-mono text-slate-300 font-semibold">{bill.previous_reading} kWh</span>
            </div>
            <span className="text-amber-500/50">→</span>
            <div>
              Cycle End: <span className="font-mono text-amber-200 font-bold">{bill.current_reading} kWh</span>
            </div>
          </div>
        </div>

        {/* Right Column: Luxury Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[230px]">
          {(isPending || isOverdue) && (
            <button
              onClick={() => onPayClick(bill)}
              className="flex items-center justify-center gap-2.5 px-7 py-4 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-200 hover:to-yellow-400 active:from-amber-400 text-slate-950 font-black rounded-2xl shadow-glow-gold transition-all transform hover:-translate-y-0.5 text-xs sm:text-sm tracking-wide"
            >
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>Settle Balance Now</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          )}

          <button
            onClick={() => onViewReceiptClick(bill)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-b from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 text-amber-100 font-semibold rounded-2xl border border-amber-400/25 backdrop-blur-md transition-all text-xs tracking-wide hover:border-amber-400/50"
          >
            <span>{isPaid ? 'Concierge Statement & Receipt' : 'View Slab Breakdown'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBillCard;
