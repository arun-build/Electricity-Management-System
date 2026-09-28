import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import {
  LayoutDashboard,
  Users,
  FileText,
  Sliders,
  History,
  X,
  LogOut,
  Hash,
  ChevronRight,
  ShieldCheck,
  Crown
} from 'lucide-react';

const Sidebar = ({ currentView, onViewChange, isOpen, onClose }) => {
  const { user, isAdmin, isConsumer, logout } = useAuth();

  const adminNav = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'consumers', label: 'Consumers Directory', icon: Users },
    { id: 'bills', label: 'Billing & Meter Registry', icon: FileText },
    { id: 'tariffs', label: 'Tariff Slab Engine', icon: Sliders },
  ];

  const consumerNav = [
    { id: 'dashboard', label: 'Accounts & Overview', icon: LayoutDashboard },
    { id: 'bills', label: 'Billing Statements', icon: History },
  ];

  const navItems = isAdmin ? adminNav : consumerNav;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-[#07090e]/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-amber-500/15 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200/80 dark:border-amber-500/15">
          <Logo size="md" />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consumer Meter Badge (if consumer) */}
        {isConsumer && user?.meter_number && (
          <div className="mx-4 mt-4 p-3.5 bg-gradient-to-br from-[#121929] to-[#0a0e17] border border-amber-500/25 rounded-2xl shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="tracking-wide">Private Meter</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-sm" />
            </div>
            <div className="mt-1 text-sm font-black font-mono tracking-tight text-white">
              {user.meter_number}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              {user.address}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-amber-200/40">
            {isAdmin ? 'System Administration' : 'Client Privileges'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-glow-gold font-bold ring-1 ring-amber-300/50'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-amber-400/5 hover:text-slate-900 dark:hover:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-slate-950' : 'text-slate-400 dark:text-amber-400/60'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Card & Logout */}
        <div className="p-4 border-t border-slate-200/80 dark:border-amber-500/15">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all border border-rose-200 dark:border-rose-900/40 hover:shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
